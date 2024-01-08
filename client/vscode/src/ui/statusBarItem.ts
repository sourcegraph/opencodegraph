import * as vscode from 'vscode'

export function createStatusBarItem(): vscode.Disposable {
    const disposables: vscode.Disposable[] = []

    const statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)
    disposables.push(statusItem)

    statusItem.command = 'openctx.toggleEnable'

    function update(): void {
        const enable = vscode.workspace.getConfiguration('openctx').get<boolean>('enable')
        if (enable) {
            statusItem.text = '$(octx-logo)'
            statusItem.tooltip = 'Disable OpenCtx'
        } else {
            statusItem.text = '$(octx-logo-off)'
            statusItem.tooltip = 'Enable OpenCtx'
        }
    }

    disposables.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('openctx.enable')) {
                update()
            }
        })
    )
    update()
    statusItem.show()

    return vscode.Disposable.from(...disposables)
}
