import { type Item } from '@openctx/schema'
import { createBaseChip } from './BaseChip'
import styles from './Chip.module.css'

/**
 * A single OpenCtx item, displayed as a "chip".
 */
export function createChip({
    item,
    className,
    popoverClassName,
}: {
    item: Item
    className?: string
    popoverClassName?: string
}): HTMLElement {
    let popover: HTMLElement | undefined
    if (item.ui?.detail) {
        const detailEl = document.createElement('p')
        detailEl.className = styles.detail
        detailEl.innerText = item.ui?.detail
        popover = detailEl
    }

    return createBaseChip({
        title: item.title,
        url: item.url,
        className,
        popover,
        popoverClassName,
    })
}
