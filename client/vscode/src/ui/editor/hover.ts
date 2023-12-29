import { type Annotation } from '@opencodegraph/client'
import { firstValueFrom, map } from 'rxjs'
import * as vscode from 'vscode'
import { type Controller } from '../../controller'

export function createHoverProvider(controller: Controller): vscode.HoverProvider & vscode.Disposable {
    return {
        async provideHover(doc, pos): Promise<vscode.Hover | null> {
            return firstValueFrom(
                controller.observeAnnotations(doc).pipe(
                    map(anns => {
                        const containedByAnns = anns?.filter(ann => (ann.range ?? ZERO_RANGE).contains(pos))
                        return containedByAnns && containedByAnns.length > 0 ? createHover(containedByAnns) : null
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

function createHover(anns: Annotation<vscode.Range>[]): vscode.Hover {
    const contents: vscode.Hover['contents'] = []
    for (const ann of anns) {
        const content = new vscode.MarkdownString()
        content.supportHtml = true

        // Render title in bold.
        content.appendMarkdown('**')
        content.appendText(ann.title)
        content.appendMarkdown('**')

        if (ann.ui?.detail) {
            content.appendMarkdown('\n\n')
            if (ann.ui.format === 'markdown') {
                content.appendMarkdown(ann.ui.detail)
            } else {
                content.appendText(ann.ui.detail)
            }
        }
        if (ann.url) {
            content.appendMarkdown('\n\n')
            content.appendMarkdown(`[Open in browser...](${ann.url})`)
        }

        contents.push(content)
    }

    return {
        contents,
        range: anns[0].range, // TODO(sqs): use smallest overlapping range
    }
}
