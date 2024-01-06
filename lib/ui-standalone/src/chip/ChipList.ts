import { type Annotation } from '@opencodegraph/schema'
import clsx from 'clsx'
import { createChip } from './Chip'
import { createChipGroup } from './ChipGroup'
import styles from './ChipList.module.css'

/**
 * A list of OpenCodeGraph chips.
 *
 * If multiple annotations share a `ui.group` value, then the annotations will be grouped.
 */
export function createChipList({
    annotations,
    className,
    chipClassName,
    popoverClassName,
}: {
    annotations: Annotation[]
    className?: string
    chipClassName?: string
    popoverClassName?: string
}): HTMLElement {
    const el = document.createElement('div')
    el.className = clsx(styles.list, className)

    const { groups, ungrouped } = groupAnnotations(annotations)
    for (const [group, anns] of Object.entries(groups)) {
        el.append(createChipGroup({ group, annotations: anns, className: chipClassName, popoverClassName }))
    }
    for (const annotation of ungrouped) {
        el.append(createChip({ annotation, className: chipClassName, popoverClassName }))
    }

    return el
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
    }
    const ungrouped = annotations.filter(ann => !ann.ui?.group || !groups[ann.ui.group])

    return { groups, ungrouped }
}
