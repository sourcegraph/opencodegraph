import { type Annotation } from '@openctx/client'
import { type createChipList } from '@openctx/ui-standalone'

export function annotationsByLine(annotations: Annotation[]): { line: number; annotations: Annotation[] }[] {
    const byLine: { line: number; annotations: Annotation[] }[] = []
    for (const ann of annotations) {
        let cur = byLine.at(-1)
        const startLine = ann.range?.start.line ?? 0
        if (!cur || cur.line !== startLine) {
            cur = { line: startLine, annotations: [] }
            byLine.push(cur)
        }
        cur.annotations.push(ann)
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
