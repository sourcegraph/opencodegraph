import { createClient, type Item, type Range } from '@openctx/client'
import { catchError, combineLatest, from, map, mergeMap, of, tap, type Observable } from 'rxjs'
import * as vscode from 'vscode'
import { createApi, type ExtensionApi } from './api'
import { getAuthInfo } from './authInfo'
import { getClientConfiguration } from './configuration'
import { dynamicImportFromSource } from './dynamicImport'
import { createCodeLensProvider } from './ui/editor/codeLens'
import { createHoverProvider } from './ui/editor/hover'
import { createShowFileItemsList } from './ui/fileItemsList'
import { createStatusBarItem } from './ui/statusBarItem'
import { observeWorkspaceConfigurationChanges, toEventEmitter } from './util'
import { createErrorWaiter } from './util/errorWaiter'

export interface Controller {
    observeItems(doc: Pick<vscode.TextDocument, 'uri' | 'getText'>): Observable<Item<vscode.Range>[] | null>
    onDidChangeProviders: vscode.Event<void>
}

export function createController(
    secrets: Observable<vscode.SecretStorage>,
    outputChannel: vscode.OutputChannel
): {
    api: ExtensionApi
    disposable: vscode.Disposable
} {
    const disposables: vscode.Disposable[] = []

    const globalConfigurationChanges = observeWorkspaceConfigurationChanges('openctx')

    // Watch for changes that could possibly affect configuration. This is overbroad because it does
    // not specify a config scope.
    const configOrSecretsChanged = toEventEmitter(
        combineLatest([globalConfigurationChanges, secrets]).pipe(map(() => undefined))
    )
    disposables.push(configOrSecretsChanged)

    const toggleEnableCommand = vscode.commands.registerCommand('openctx.toggleEnable', async () => {
        const currentValue = getClientConfiguration().enable
        await vscode.workspace.getConfiguration('openctx').update('enable', !currentValue)
    })
    disposables.push(toggleEnableCommand)

    const statusBarItem = createStatusBarItem()
    disposables.push(statusBarItem)

    // Pause for 10 seconds if we get 5 errors in a row.
    const errorWaiter = createErrorWaiter(10 * 1000, 5)
    disposables.push(errorWaiter)

    const client = createClient<vscode.Range>({
        configuration: file => {
            const scope = file ? vscode.Uri.parse(file) : undefined
            return observeWorkspaceConfigurationChanges('openctx', scope).pipe(map(() => getClientConfiguration(scope)))
        },
        authInfo: provider => secrets.pipe(mergeMap(secrets => from(getAuthInfo(secrets, provider)))),
        makeRange,
        logger: message => outputChannel.appendLine(message),

        // On VS Code desktop, use a workaround for dynamic imports.
        dynamicImportFromSource:
            vscode.env.uiKind === vscode.UIKind.Desktop && process.env.DESKTOP_BUILD
                ? dynamicImportFromSource
                : undefined,
    })

    /**
     * The controller is passed to UI feature providers for them to fetch data.
     */
    const controller: Controller = {
        observeItems(doc: vscode.TextDocument): Observable<Item<vscode.Range>[] | null> {
            if (ignoreDoc(doc)) {
                return of(null)
            }

            if (!errorWaiter.ok()) {
                return of(null)
            }

            return client
                .itemsChanges(
                    {
                        file: doc.uri.toString(),
                        content: doc.getText(),
                    },
                    {
                        emitPartial: false, // TODO(sqs): make this not needed so codelens show up as soon as they're ready from a single provider
                    }
                )
                .pipe(
                    tap({
                        next(): void {
                            errorWaiter.gotError(false)
                        },
                        error(): void {
                            // Show an error notification unless we've recently shown one (to avoid annoying
                            // the user).
                            const shouldNotify = errorWaiter.timeSinceLastError() > 1000 * 60 * 15 /* 15 min */
                            if (shouldNotify) {
                                showErrorNotification(outputChannel)
                            }

                            errorWaiter.gotError(true)
                        },
                    }),
                    catchError(error => {
                        outputChannel.appendLine(error)
                        return of(null)
                    })
                )
        },
        onDidChangeProviders: configOrSecretsChanged.event,
    }

    // The UI feature providers (code lens and hover) should stay registered even if the global
    // `openctx.enable` value is `false` because it might be overridden to `true` at another
    // level of configuration. If the UI feature providers are invoked in a file where they're
    // disabled, the provider will quickly return no results.
    const codeLensProvider = createCodeLensProvider(controller)
    const hoverProvider = createHoverProvider(controller)
    const quickPickCommand = createShowFileItemsList(controller)
    disposables.push(
        codeLensProvider,
        hoverProvider,
        quickPickCommand,
        vscode.languages.registerCodeLensProvider({ scheme: '*' }, codeLensProvider),
        vscode.languages.registerHoverProvider({ scheme: '*' }, hoverProvider)
    )

    return {
        disposable: vscode.Disposable.from(...disposables),
        api: createApi(controller),
    }
}

function ignoreDoc(doc: vscode.TextDocument): boolean {
    // Ignore:
    // - documents that are not in the editor (`output` is the VS Code output channel).
    // - very long documents
    return doc.uri.scheme === 'output' || doc.lineCount > 5000
}

export function makeRange(range: Range): vscode.Range {
    return new vscode.Range(range.start.line, range.start.character, range.end.line, range.end.character)
}

function showErrorNotification(outputChannel: vscode.OutputChannel): void {
    const OPEN_LOG = 'Open Log'
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    vscode.window
        .showErrorMessage('OpenCtx items failed.', {
            title: OPEN_LOG,
        } satisfies vscode.MessageItem)
        .then(action => {
            if (action?.title === OPEN_LOG) {
                outputChannel.show()
            }
        })
}
