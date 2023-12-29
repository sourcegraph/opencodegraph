import { type Annotation } from '@opencodegraph/client'
import * as vscode from 'vscode'
import { type Controller } from '../controller'

const COMMAND_ID = 'opencodegraph.showFileAnnotations'

export function createShowFileAnnotationsList(controller: Controller): vscode.Disposable {
    const disposables: vscode.Disposable[] = []

    disposables.push(vscode.commands.registerCommand(COMMAND_ID, () => showQuickPick(controller)))

    return vscode.Disposable.from(...disposables)
}

interface QuickPickItem extends vscode.QuickPickItem {
    // TODO(sqs): support groups
    annotation: Annotation<vscode.Range> | null
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
                anns && anns.length > 0
                    ? toQuickPickItems(anns)
                    : [{ label: 'No OpenCodeGraph annotations', annotation: null }]
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
            const activeItem = activeItems.at(0)
            if (activeItem?.annotation?.range) {
                editor.revealRange(activeItem.annotation.range, vscode.TextEditorRevealType.InCenterIfOutsideViewport)
                editor.selection = new vscode.Selection(
                    activeItem.annotation.range.start,
                    activeItem.annotation.range.end
                )
            }
        })
    )

    disposables.push(
        quickPick.onDidAccept(() => {
            const selectedItem = quickPick.selectedItems[0]
            if (!selectedItem) {
                return
            }
            if (selectedItem.annotation?.url) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                vscode.commands.executeCommand('vscode.open', selectedItem.annotation?.url)
            }
            disposeAll()
        })
    )

    disposables.push(
        quickPick.onDidTriggerItemButton(e => {
            if (e.item.annotation?.url) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                vscode.commands.executeCommand('vscode.open', e.item.annotation.url)
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

function toQuickPickItems(anns: Annotation<vscode.Range>[]): QuickPickItem[] {
    const items: (QuickPickItem & RequiredNotNull<Pick<QuickPickItem, 'annotation'>>)[] = []
    for (const ann of anns) {
        items.push({
            label: ann.title,
            detail: ann.ui?.detail,
            buttons: ann.url
                ? [{ tooltip: `Open ${ann.url}`, iconPath: new vscode.ThemeIcon('link-external') }]
                : undefined,
            annotation: ann,
        })
    }
    return items.sort((a, b) =>
        (a.annotation.range ?? ZERO_RANGE).start.compareTo((b.annotation.range ?? ZERO_RANGE).start)
    )
}

const ZERO_RANGE = new vscode.Range(0, 0, 0, 0)
