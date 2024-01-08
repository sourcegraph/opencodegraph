import { RangeSetBuilder, type EditorState, type Extension } from '@codemirror/state'
import { Decoration, EditorView, WidgetType, type DecorationSet } from '@codemirror/view'
import { type Item } from '@openctx/client'
import { prepareItemsForPresentation } from '@openctx/ui-common'
import deepEqual from 'deep-equal'
import { openCtxDataFacet, type OpenCtxDecorationsConfig } from './extension'

class BlockWidget extends WidgetType {
    private container: HTMLElement | null = null
    private decoration: ReturnType<OpenCtxDecorationsConfig['createDecoration']> | undefined

    constructor(
        private readonly items: Item[],
        private readonly indent: string | undefined,
        private readonly config: OpenCtxDecorationsConfig
    ) {
        super()
    }

    public eq(other: BlockWidget): boolean {
        return this.config.visibility === other.config.visibility && deepEqual(this.items, other.items)
    }

    public toDOM(): HTMLElement {
        if (!this.container) {
            this.container = document.createElement('div')
            this.decoration = this.config.createDecoration(this.container, {
                indent: this.indent,
                items: this.items,
            })
        }
        return this.container
    }

    public destroy(): void {
        this.container?.remove()
        // setTimeout seems necessary to prevent React from complaining that the
        // root is synchronously unmounted while rendering is in progress
        setTimeout(() => this.decoration?.destroy?.(), 0)
    }
}

function computeDecorations(
    state: EditorState,
    items: Item[],
    config: OpenCtxDecorationsConfig
): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>()

    const itemsByLine: { line: number; items: Item[] }[] = []
    for (const item of prepareItemsForPresentation(items)) {
        let cur = itemsByLine.at(-1)
        const startLine = item.ui?.presentationHints?.includes('show-at-top-of-file') ? 0 : item.range?.start.line ?? 0
        if (!cur || cur.line !== startLine) {
            cur = { line: startLine, items: [] }
            itemsByLine.push(cur)
        }
        cur.items.push(item)
    }

    for (const { line: lineNum, items } of itemsByLine) {
        const line = state.doc.line(lineNum + 1)
        const indent = line.text.match(/^\s*/)?.[0]
        builder.add(
            line.from,
            line.from,
            Decoration.widget({
                widget: new BlockWidget(items, indent, config),
            })
        )
    }

    return builder.finish()
}

export function openCtxWidgets(config: OpenCtxDecorationsConfig): Extension {
    return [
        EditorView.decorations.compute(['doc', openCtxDataFacet], state => {
            const data = state.facet(openCtxDataFacet)
            return computeDecorations(state, data, config)
        }),
    ]
}
