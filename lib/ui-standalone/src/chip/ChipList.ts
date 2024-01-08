import { type Annotation } from '@opencodegraph/schema'
import { groupAnnotations } from '@opencodegraph/ui-common'
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
    for (const [group, anns] of groups) {
        el.append(createChipGroup({ group, annotations: anns, className: chipClassName, popoverClassName }))
    }
    for (const annotation of ungrouped) {
        el.append(createChip({ annotation, className: chipClassName, popoverClassName }))
    }

    return el
}
