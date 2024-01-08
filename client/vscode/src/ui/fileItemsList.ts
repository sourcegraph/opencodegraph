import { type Item } from '@openctx/client'
import * as vscode from 'vscode'
import { type Controller } from '../controller'

const COMMAND_ID = 'openctx.showFileItems'

export function createShowFileItemsList(controller: Controller): vscode.Disposable {
    const disposables: vscode.Disposable[] = []

    disposables.push(vscode.commands.registerCommand(COMMAND_ID, () => showQuickPick(controller)))

    return vscode.Disposable.from(...disposables)
}

interface QuickPickItem extends vscode.QuickPickItem {
    // TODO(sqs): support groups
    item: Item<vscode.Range> | null
}

async function showQuickPick(controller: Controller): Promise<void> {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
        await vscode.window.showErrorMessage('No active text editor')
        return
    }

    const disposables: vscode.Disposable[] = []
    function disposeAll(): void {
        vscode.Disposable.from(...disposables).dispose()
    }

    const quickPick = vscode.window.createQuickPick<QuickPickItem>()
    disposables.push(quickPick)
    quickPick.title = 'OpenCtx Context for File'
    quickPick.busy = true
    quickPick.keepScrollPosition = false
    quickPick.matchOnDescription = true
    quickPick.matchOnDetail = true
    quickPick.show()

    const subscription = controller.observeItems(editor.document).subscribe(
        items => {
            quickPick.items =
                items && items.length > 0 ? toQuickPickItems(items) : [{ label: 'No OpenCtx items', item: null }]
            quickPick.busy = false
        },
        error => {
            console.error(error)
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            vscode.window.showErrorMessage('Error loading OpenCtx items')
            disposeAll()
        },
        () => disposeAll()
    )
    disposables.push({ dispose: () => subscription.unsubscribe() })

    disposables.push(
        quickPick.onDidChangeActive(activeItems => {
            const activeItem = activeItems.at(0)
            if (activeItem?.item?.range) {
                editor.revealRange(activeItem.item.range, vscode.TextEditorRevealType.InCenterIfOutsideViewport)
                editor.selection = new vscode.Selection(activeItem.item.range.start, activeItem.item.range.end)
            }
        })
    )

    disposables.push(
        quickPick.onDidAccept(() => {
            const selectedItem = quickPick.selectedItems[0]
            if (!selectedItem) {
                return
            }
            if (selectedItem.item?.url) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                vscode.commands.executeCommand('vscode.open', selectedItem.item?.url)
            }
            quickPick.hide()
            disposeAll()
        })
    )

    disposables.push(
        quickPick.onDidTriggerItemButton(e => {
            if (e.item.item?.url) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                vscode.commands.executeCommand('vscode.open', e.item.item.url)
            }
            disposeAll()
        })
    )

    disposables.push(
        quickPick.onDidHide(() => {
            disposeAll()
            subscription.unsubscribe()
        })
    )
}

type RequiredNotNull<T> = {
    [P in keyof T]-?: NonNullable<T[P]>
}

function toQuickPickItems(items: Item<vscode.Range>[]): QuickPickItem[] {
    const qpItems: (QuickPickItem & RequiredNotNull<Pick<QuickPickItem, 'item'>>)[] = []
    for (const item of items) {
        qpItems.push({
            label: item.title,
            detail: item.ui?.detail,
            buttons: item.url
                ? [{ tooltip: `Open ${item.url}`, iconPath: new vscode.ThemeIcon('link-external') }]
                : undefined,
            item,
        })
    }
    return qpItems.sort((a, b) => (a.item.range ?? ZERO_RANGE).start.compareTo((b.item.range ?? ZERO_RANGE).start))
}

const ZERO_RANGE = new vscode.Range(0, 0, 0, 0)
