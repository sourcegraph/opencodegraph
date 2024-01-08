import { type Item } from '@openctx/client'
import { type createChipList } from '@openctx/ui-standalone'

export function itemsByLine(items: Item[]): { line: number; items: Item[] }[] {
    const byLine: { line: number; items: Item[] }[] = []
    for (const item of items) {
        let cur = byLine.at(-1)
        const startLine = item.range?.start.line ?? 0
        if (!cur || cur.line !== startLine) {
            cur = { line: startLine, items: [] }
            byLine.push(cur)
        }
        cur.items.push(item)
    }
    return byLine
}

export const LINE_CHIPS_CLASSNAME = 'octx-line-chips'

export function styledChipListParams(
    params: Omit<Parameters<typeof createChipList>[0], 'className' | 'chipClassName' | 'popoverClassName'>
): Parameters<typeof createChipList>[0] {
    return {
        ...params,
        className: LINE_CHIPS_CLASSNAME,
        chipClassName: 'octx-chip',
        popoverClassName: 'octx-chip-popover',
    }
}
