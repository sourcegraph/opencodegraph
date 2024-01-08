import { type Annotation } from '@openctx/schema'
import { createBaseChip } from './BaseChip'
import styles from './Chip.module.css'

/**
 * A single OpenCtx annotation, displayed as a "chip".
 */
export function createChip({
    annotation,
    className,
    popoverClassName,
}: {
    annotation: Annotation
    className?: string
    popoverClassName?: string
}): HTMLElement {
    let popover: HTMLElement | undefined
    if (annotation.ui?.detail) {
        const detailEl = document.createElement('p')
        detailEl.className = styles.detail
        detailEl.innerText = annotation.ui?.detail
        popover = detailEl
    }

    return createBaseChip({
        title: annotation.title,
        url: annotation.url,
        className,
        popover,
        popoverClassName,
    })
}
