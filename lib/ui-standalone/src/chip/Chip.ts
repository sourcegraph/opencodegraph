import { type Annotation } from '@opencodegraph/schema'
import clsx from 'clsx'
import styles from './Chip.module.css'
import { getPopoverDimensions } from './popover'

/**
 * A single OpenCodeGraph annotation, displayed as a "chip".
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
    const el = document.createElement('aside')
    el.className = clsx(styles.chip, className)

    const headerEl = document.createElement('header')

    const titleEl = document.createElement('h4')
    titleEl.className = styles.title
    titleEl.innerText = annotation.title
    headerEl.append(titleEl)

    if (annotation.url) {
        const linkEl = document.createElement('a')
        linkEl.className = styles.stretchedLink
        linkEl.ariaHidden = 'true'
        linkEl.href = annotation.url
        headerEl.append(linkEl)
    }

    if (annotation.url || annotation.ui) {
        headerEl.tabIndex = 0
    }

    el.append(headerEl)

    if (annotation.ui?.detail) {
        const popoverEl = document.createElement('div')
        popoverEl.popover = 'auto'
        popoverEl.className = styles.popover
        popoverEl.append(
            createPopoverContent({
                ui: annotation.ui,
                className: popoverClassName,
            })
        )

        // DOM event listeners are automatically removed when the element is removed, so we don't
        // need to track these elsewhere for cleanup.
        const showPopover = (): void => {
            // Need to call showPopover before getPopoverDimensions because it needs to be displayed
            // in order to calculate its dimensions.
            popoverEl.showPopover()

            const { top, left } = getPopoverDimensions(el, popoverEl)
            popoverEl.style.top = top
            popoverEl.style.left = left
        }
        const hidePopover = (): void => popoverEl.hidePopover()
        headerEl.addEventListener('mouseenter', showPopover)
        headerEl.addEventListener('mouseleave', hidePopover)
        headerEl.addEventListener('focus', showPopover)
        headerEl.addEventListener('blur', hidePopover)

        // Useful for debugging:
        //
        // setTimeout(() => showPopover())

        el.append(popoverEl)
    }

    return el
}

function createPopoverContent({
    ui: { detail },
    className,
}: { ui: NonNullable<Annotation['ui']> } & { className?: string }): HTMLElement {
    // TODO(sqs): support markdown
    const el = document.createElement('aside')
    el.className = clsx(styles.popoverContent, className)

    if (detail) {
        const detailEl = document.createElement('p')
        detailEl.className = styles.detail
        detailEl.innerText = detail
        el.append(detailEl)
    }

    return el
}

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
    for (const annotation of annotations) {
        el.append(createChip({ annotation, className: chipClassName, popoverClassName }))
    }
    return el
}
