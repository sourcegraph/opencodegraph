import { type Item } from '@openctx/schema'
import { createBaseChip } from './BaseChip'
import styles from './ChipGroup.module.css'

export function createChipGroup({
    group,
    items,
    className,
    popoverClassName,
}: {
    group: string
    items: Item[]
    className?: string
    popoverClassName?: string
}): HTMLElement {
    return createBaseChip({ title: group, className, popover: createChipList(items), popoverClassName })
}

function createChipList(items: Item[]): HTMLElement {
    const el = document.createElement('ul')
    el.className = styles.list
    for (const item of items) {
        el.append(createChipListItem(item))
    }
    return el
}

function createChipListItem(item: Item): HTMLElement {
    const el = document.createElement('li')
    el.tabIndex = -1

    if (item.url) {
        const linkEl = document.createElement('a')
        linkEl.title = item.ui?.detail ?? ''
        linkEl.href = item.url
        linkEl.className = styles.listItemLink
        linkEl.innerText = item.title
        el.append(linkEl)
    } else {
        const spanEl = document.createElement('span')
        spanEl.title = item.ui?.detail ?? ''
        spanEl.innerText = item.title
        el.append(spanEl)
    }

    return el
}
