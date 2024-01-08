import { type Item } from '@openctx/client'
import { firstValueFrom, map } from 'rxjs'
import * as vscode from 'vscode'
import { type Controller } from '../../controller'

export function createHoverProvider(controller: Controller): vscode.HoverProvider & vscode.Disposable {
    return {
        async provideHover(doc, pos): Promise<vscode.Hover | null> {
            return firstValueFrom(
                controller.observeItems(doc).pipe(
                    map(items => {
                        const containedByItems = items?.filter(item => (item.range ?? ZERO_RANGE).contains(pos))
                        return containedByItems && containedByItems.length > 0 ? createHover(containedByItems) : null
                    })
                )
            )
        },
        dispose() {
            /* noop */
        },
    }
}

const ZERO_RANGE = new vscode.Range(0, 0, 0, 0)

function createHover(items: Item<vscode.Range>[]): vscode.Hover {
    const contents: vscode.Hover['contents'] = []
    for (const item of items) {
        const content = new vscode.MarkdownString()
        content.supportHtml = true

        // Render title in bold.
        content.appendMarkdown('**')
        content.appendText(item.title)
        content.appendMarkdown('**')

        if (item.ui?.detail) {
            content.appendMarkdown('\n\n')
            if (item.ui.format === 'markdown') {
                content.appendMarkdown(item.ui.detail)
            } else {
                content.appendText(item.ui.detail)
            }
        }
        if (item.url) {
            content.appendMarkdown('\n\n')
            content.appendMarkdown(`[Open in browser...](${item.url})`)
        }

        contents.push(content)
    }

    return {
        contents,
        range: items[0].range, // TODO(sqs): use smallest overlapping range
    }
}
