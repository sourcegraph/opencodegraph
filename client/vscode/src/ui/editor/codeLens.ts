import { groupItems, prepareItemsForPresentation, type ItemWithAdjustedRange } from '@openctx/ui-common'
import { firstValueFrom, map, type Observable } from 'rxjs'
import * as vscode from 'vscode'
import { makeRange, type Controller } from '../../controller'

interface CodeLens extends vscode.CodeLens {}

export function createCodeLensProvider(controller: Controller): vscode.CodeLensProvider<CodeLens> & {
    observeCodeLenses(doc: vscode.TextDocument): Observable<CodeLens[]>
} & vscode.Disposable {
    const disposables: vscode.Disposable[] = []

    const showHover = createShowHoverCommand()
    disposables.push(showHover)

    const showGroup = createShowGroupCommand()
    disposables.push(showGroup)

    const changeCodeLenses = new vscode.EventEmitter<void>()
    disposables.push(changeCodeLenses)

    disposables.push(controller.onDidChangeProviders(() => changeCodeLenses.fire()))

    const provider = {
        onDidChangeCodeLenses: changeCodeLenses.event,
        observeCodeLenses(doc: vscode.TextDocument): Observable<CodeLens[]> {
            return controller.observeItems(doc).pipe(
                map(items => {
                    if (items === null) {
                        return []
                    }
                    const { groups, ungrouped } = groupItems(
                        prepareItemsForPresentation<vscode.Range>(items, makeRange)
                    )
                    return [
                        ...groups.map(([group, items]) => groupCodeLens(group, items, showGroup)),
                        ...ungrouped.map(item => itemCodeLens(doc, item, showHover)),
                    ]
                })
            )
        },
        async provideCodeLenses(doc: vscode.TextDocument): Promise<CodeLens[]> {
            return firstValueFrom(provider.observeCodeLenses(doc), { defaultValue: [] })
        },
        dispose() {
            for (const disposable of disposables) {
                disposable.dispose()
            }
        },
    }
    return provider
}

/** Create a code lens for a single item. */
function itemCodeLens(
    doc: vscode.TextDocument,
    item: ItemWithAdjustedRange<vscode.Range>,
    showHover: ReturnType<typeof createShowHoverCommand>
): CodeLens {
    // If the presentationHint `show-at-top-of-file` is used, show the code lens at the top of the
    // file, but make it trigger the hover at its actual location.
    const attachRange = item.range ?? new vscode.Range(0, 0, 0, 0)
    const hoverRange = item.originalRange ?? attachRange
    return {
        range: attachRange,
        command: {
            title: item.title,
            ...(item.ui?.detail && !item.ui.presentationHints?.includes('prefer-link-over-detail')
                ? showHover.createCommandArgs(doc.uri, hoverRange.start)
                : item.url
                ? openWebBrowserCommandArgs(item.url)
                : { command: 'noop' }),
        },
        isResolved: true,
    }
}

function createShowHoverCommand(): {
    createCommandArgs: (uri: vscode.Uri, pos: vscode.Position) => Pick<vscode.Command, 'command' | 'arguments'>
} & vscode.Disposable {
    const COMMAND_ID = 'openctx._showHover'
    const disposable = vscode.commands.registerCommand(COMMAND_ID, (uri: vscode.Uri, pos: vscode.Position): void => {
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

/** Create a code lens for a group of items. */
function groupCodeLens(
    group: string,
    items: ItemWithAdjustedRange<vscode.Range>[],
    showGroup: ReturnType<typeof createShowGroupCommand>
): CodeLens {
    // Attach to the range of the first item with a range.
    const attachRange = items.find(item => item.range)?.range ?? new vscode.Range(0, 0, 0, 0)
    return {
        range: attachRange,
        command: {
            title: group,
            ...showGroup.createCommandArgs(group, items),
        },
        isResolved: true,
    }
}

function createShowGroupCommand(): {
    createCommandArgs: (
        group: string,
        items: ItemWithAdjustedRange<vscode.Range>[]
    ) => Pick<vscode.Command, 'command' | 'arguments'>
} & vscode.Disposable {
    const disposables: vscode.Disposable[] = []

    const COMMAND_ID = 'openctx._showGroup'

    interface QuickPickItem extends vscode.QuickPickItem {
        item: ItemWithAdjustedRange<vscode.Range>
    }
    const quickPick = vscode.window.createQuickPick<QuickPickItem>()
    disposables.push(quickPick)
    disposables.push(
        quickPick.onDidAccept(() => {
            const item = quickPick.selectedItems.at(0)
            if (item?.item.url) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(item.item.url))
                quickPick.hide()
            }
        })
    )

    disposables.push(
        vscode.commands.registerCommand(
            COMMAND_ID,
            (group: string, items: ItemWithAdjustedRange<vscode.Range>[]): void => {
                quickPick.title = group
                quickPick.items = items.map(item => ({
                    label: item.title,
                    detail: item.url,
                    item,
                }))
                quickPick.show()
            }
        )
    )
    return {
        createCommandArgs(group, items) {
            return {
                command: COMMAND_ID,
                arguments: [group, items],
            }
        },
        dispose() {
            vscode.Disposable.from(...disposables).dispose()
        },
    }
}

function openWebBrowserCommandArgs(url: string): Pick<vscode.Command, 'command' | 'arguments'> {
    return {
        command: 'vscode.open',
        arguments: [vscode.Uri.parse(url)],
    }
}
