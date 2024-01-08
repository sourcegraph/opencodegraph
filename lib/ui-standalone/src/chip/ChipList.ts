import { type Item } from '@openctx/schema'
import { groupItems } from '@openctx/ui-common'
import clsx from 'clsx'
import { createChip } from './Chip'
import { createChipGroup } from './ChipGroup'
import styles from './ChipList.module.css'

/**
 * A list of OpenCtx chips.
 *
 * If multiple items share a `ui.group` value, then the items will be grouped.
 */
export function createChipList({
    items,
    className,
    chipClassName,
    popoverClassName,
}: {
    items: Item[]
    className?: string
    chipClassName?: string
    popoverClassName?: string
}): HTMLElement {
    const el = document.createElement('div')
    el.className = clsx(styles.list, className)

    const { groups, ungrouped } = groupItems(items)
    for (const [group, items] of groups) {
        el.append(createChipGroup({ group, items: items, className: chipClassName, popoverClassName }))
    }
    for (const item of ungrouped) {
        el.append(createChip({ item, className: chipClassName, popoverClassName }))
    }

    return el
}
