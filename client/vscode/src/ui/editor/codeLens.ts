import { prepareAnnotationsForPresentation } from '@opencodegraph/ui-common'
import { type AnnotationWithAdjustedRange } from '@opencodegraph/ui-common/src/ui'
import { firstValueFrom, map } from 'rxjs'
import * as vscode from 'vscode'
import { makeRange, type Controller } from '../../controller'

interface CodeLens extends vscode.CodeLens {}

export function createCodeLensProvider(controller: Controller): vscode.CodeLensProvider<CodeLens> & vscode.Disposable {
    const disposables: vscode.Disposable[] = []

    const showHover = createShowHoverCommand()
    disposables.push(showHover)

    const changeCodeLenses = new vscode.EventEmitter<void>()
    disposables.push(changeCodeLenses)

    disposables.push(controller.onDidChangeProviders(() => changeCodeLenses.fire()))

    return {
        onDidChangeCodeLenses: changeCodeLenses.event,
        async provideCodeLenses(doc: vscode.TextDocument): Promise<CodeLens[]> {
            return firstValueFrom(
                controller.observeAnnotations(doc).pipe(
                    map(anns => {
                        if (anns === null) {
                            return []
                        }
                        return prepareAnnotationsForPresentation<vscode.Range>(anns, makeRange).map(ann =>
                            createCodeLens(doc, ann, showHover)
                        )
                    })
                ),
                { defaultValue: [] }
            )
        },
        dispose() {
            for (const disposable of disposables) {
                disposable.dispose()
            }
        },
    }
}

function createCodeLens(
    doc: vscode.TextDocument,
    ann: AnnotationWithAdjustedRange<vscode.Range>,
    showHover: ReturnType<typeof createShowHoverCommand>
): CodeLens {
    // If the presentationHint `group-at-top-of-file` is used, show the code lens at the top of the
    // file, but make it trigger the hover at its actual location.
    const attachRange = ann.range ?? new vscode.Range(0, 0, 0, 0)
    const hoverRange = ann.originalRange ?? attachRange
    return {
        range: attachRange,
        command: {
            title: ann.title,
            ...(ann.ui?.detail && !ann.ui.presentationHints?.includes('prefer-link-over-detail')
                ? showHover.createCommandArgs(doc.uri, hoverRange.start)
                : ann.url
                ? openWebBrowserCommandArgs(ann.url)
                : { command: 'noop' }),
        },
        isResolved: true,
    }
}

function createShowHoverCommand(): {
    createCommandArgs: (uri: vscode.Uri, pos: vscode.Position) => Pick<vscode.Command, 'command' | 'arguments'>
} & vscode.Disposable {
    const COMMAND_ID = 'opencodegraph._showHover'
    const disposable = vscode.commands.registerCommand(COMMAND_ID, (uri: vscode.Uri, pos: vscode.Position) => {
        const editor = vscode.window.activeTextEditor
        if (!editor || editor.document.uri.toString() !== uri.toString()) {
            return
        }
        editor.selections = [new vscode.Selection(pos, pos)]
        // eslint-disable-next-line no-void
        void vscode.commands.executeCommand('editor.action.showHover')
    })
    return {
        createCommandArgs(uri, pos) {
            return {
                command: COMMAND_ID,
                arguments: [uri, pos],
            }
        },
        dispose() {
            disposable.dispose()
        },
    }
}

function openWebBrowserCommandArgs(url: string): Pick<vscode.Command, 'command' | 'arguments'> {
    return {
        command: 'vscode.open',
        arguments: [vscode.Uri.parse(url)],
    }
}
