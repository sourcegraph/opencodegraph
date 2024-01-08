import { type Item } from '@openctx/schema'
import { groupItems } from '@openctx/ui-common'
import clsx from 'clsx'
import { type FunctionComponent } from 'react'
import { Chip } from './Chip'
import { ChipGroup } from './ChipGroup'
import styles from './ChipList.module.css'

/**
 * A list of OpenCtx items (displayed as "chips").
 *
 * If multiple items share a `ui.group` value, then the items will be grouped.
 */
export const ChipList: FunctionComponent<{
    items: Item[]
    className?: string
    chipClassName?: string
    popoverClassName?: string
}> = ({ items, className, chipClassName, popoverClassName }) => {
    const { groups, ungrouped } = groupItems(items)
    return (
        <div className={clsx(styles.list, className)}>
            {groups.map(([group, items]) => (
                <ChipGroup
                    key={`g:${group}`}
                    group={group}
                    items={items}
                    className={chipClassName}
                    popoverClassName={popoverClassName}
                />
            ))}
            {ungrouped.map((item, i) => (
                <Chip
                    key={`u:${item.url ?? i}`}
                    item={item}
                    className={chipClassName}
                    popoverClassName={popoverClassName}
                />
            ))}
        </div>
    )
}
