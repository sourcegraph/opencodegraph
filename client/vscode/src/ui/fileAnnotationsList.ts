import { type Annotation, type Item } from '@opencodegraph/client'
import * as vscode from 'vscode'
import { type Controller } from '../controller'

const COMMAND_ID = 'opencodegraph.showFileAnnotations'

export function createShowFileAnnotationsList(controller: Controller): vscode.Disposable {
    const disposables: vscode.Disposable[] = []

    disposables.push(vscode.commands.registerCommand(COMMAND_ID, () => showQuickPick(controller)))

    return vscode.Disposable.from(...disposables)
}

interface QuickPickItem extends vscode.QuickPickItem {
    item?: Item
    firstRange?: vscode.Range
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
    quickPick.title = 'OpenCodeGraph Context for File'
    quickPick.busy = true
    quickPick.keepScrollPosition = false
    quickPick.matchOnDescription = true
    quickPick.matchOnDetail = true
    quickPick.show()

    const subscription = controller.observeAnnotations(editor.document).subscribe(
        anns => {
            quickPick.items =
                anns && anns.length > 0 ? toQuickPickItems(anns) : [{ label: 'No OpenCodeGraph annotations' }]
            quickPick.busy = false
        },
        error => {
            console.error(error)
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            vscode.window.showErrorMessage('Error loading OpenCodeGraph annotations')
            disposeAll()
        },
        () => disposeAll()
    )
    disposables.push({ dispose: () => subscription.unsubscribe() })

    disposables.push(
        quickPick.onDidChangeActive(activeItems => {
            const activeItem = activeItems[0]
            if (activeItem?.firstRange) {
                editor.revealRange(activeItem.firstRange, vscode.TextEditorRevealType.InCenterIfOutsideViewport)
                editor.selection = new vscode.Selection(activeItem.firstRange.start, activeItem.firstRange.end)
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

function toQuickPickItems(anns: Annotation<vscode.Range>[]): QuickPickItem[] {
    const items: (QuickPickItem & Required<Pick<QuickPickItem, 'item' | 'firstRange'>>)[] = []
    for (const ann of anns) {
        items.push({
            label: ann.item.title,
            detail: ann.item.detail,
            buttons: ann.item.url
                ? [{ tooltip: `Open ${ann.item.url}`, iconPath: new vscode.ThemeIcon('link-external') }]
                : undefined,
            item: ann.item,
            firstRange: ann.range,
        })
    }
    return items.sort((a, b) => a.firstRange.start.compareTo(b.firstRange.start))
}
