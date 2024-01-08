import { type Annotation, type Range } from '@opencodegraph/schema'

export interface AnnotationWithAdjustedRange<R extends Range> extends Omit<Annotation, 'range'> {
    range?: R
    originalRange?: R
}

/**
 * Applies presentation hints to annotations.
 */
export function prepareAnnotationsForPresentation(annotations: Annotation[]): Annotation[]
export function prepareAnnotationsForPresentation<R extends Range = Range>(
    annotations: AnnotationWithAdjustedRange<R>[],
    makeRange: (range: Range) => R
): AnnotationWithAdjustedRange<R>[]
export function prepareAnnotationsForPresentation<R extends Range = Range>(
    annotations: AnnotationWithAdjustedRange<R>[],
    makeRange?: (range: Range) => R
): AnnotationWithAdjustedRange<R>[] {
    return annotations
        .map(ann => {
            if (ann.ui?.presentationHints?.includes('show-at-top-of-file')) {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                ann = {
                    ...ann,
                    originalRange: ann.range,
                    range: makeRange ? makeRange(ZERO_RANGE) : ZERO_RANGE,
                } as AnnotationWithAdjustedRange<R>
            }
            return ann
        })
        .toSorted((a, b) => (a.range?.start.line ?? 0) - (b.range?.start.line ?? 0))
}

const ZERO_RANGE: Range = { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }

/**
 * Group annotations that have the same `ui.group` value.
 */
export function groupAnnotations(annotations: Annotation[]): {
    groups: { [group: string]: Annotation[] }
    ungrouped: Annotation[]
} {
    const groups: { [group: string]: Annotation[] } = {}
    for (const ann of annotations) {
        if (ann.ui?.group) {
            if (!groups[ann.ui.group]) {
                groups[ann.ui.group] = []
            }
            groups[ann.ui.group].push(ann)
        }
    }
    for (const [group, anns] of Object.entries(groups)) {
        if (anns.length === 1) {
            delete groups[group]
        }

        // Ensure unique on (title, url).
        const seen = new Set<string>()
        groups[group] = anns.filter(ann => {
            const key = `${ann.title}:${ann.url}`
            if (seen.has(key)) {
                return false
            }
            seen.add(key)
            return true
        })
    }
    const ungrouped = annotations.filter(ann => !ann.ui?.group || !groups[ann.ui.group])

    return { groups, ungrouped }
}
