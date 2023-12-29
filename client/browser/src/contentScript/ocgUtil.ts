import { type Annotation } from '@opencodegraph/client'
import { type createChipList } from '@opencodegraph/ui-standalone'

export function annotationsByLine(annotations: Annotation[]): { line: number; annotations: Annotation[] }[] {
    const byLine: { line: number; annotations: Annotation[] }[] = []
    for (const ann of annotations) {
        let cur = byLine.at(-1)
        if (!cur || cur.line !== ann.range.start.line) {
            cur = { line: ann.range.start.line, annotations: [] }
            byLine.push(cur)
        }
        cur.annotations.push(ann)
    }
    return byLine
}

export const LINE_CHIPS_CLASSNAME = 'ocg-line-chips'

export function styledItemChipListParams(
    params: Omit<Parameters<typeof createChipList>[0], 'className' | 'chipClassName' | 'popoverClassName'>
): Parameters<typeof createChipList>[0] {
    return {
        ...params,
        className: LINE_CHIPS_CLASSNAME,
        chipClassName: 'ocg-chip',
        popoverClassName: 'ocg-chip-popover',
    }
}
