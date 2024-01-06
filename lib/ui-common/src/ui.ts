import { type Annotation } from '@opencodegraph/schema'

/**
 * Applies presentation hints to annotations.
 */
export function prepareAnnotationsForPresentation(annotations: Annotation[]): Annotation[] {
    return annotations.map(ann => {
        if (ann.ui?.presentationHints?.includes('group-at-top-of-file')) {
            ann = { ...ann, range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } } }
        }
        return ann
    })
}

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
