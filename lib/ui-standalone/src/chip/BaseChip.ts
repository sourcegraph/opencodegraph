import clsx from 'clsx'
import styles from './BaseChip.module.css'
import { getPopoverDimensions } from './popover'

export function createBaseChip({
    title,
    url,
    className,
    popover,
    popoverClassName,
}: {
    title: string
    url?: string
    className?: string
    popover?: HTMLElement | null
    popoverClassName?: string
}): HTMLElement {
    const el = document.createElement('aside')
    el.className = clsx(styles.chip, className)

    const headerEl = document.createElement('header')
    headerEl.className = styles.header

    const titleEl = document.createElement('h4')
    titleEl.className = styles.title
    titleEl.innerText = title
    headerEl.append(titleEl)

    if (url) {
        const linkEl = document.createElement('a')
        linkEl.className = styles.stretchedLink
        linkEl.ariaHidden = 'true'
        linkEl.href = url
        headerEl.append(linkEl)
    }

    if (url || popover) {
        headerEl.tabIndex = 0
    }

    el.append(headerEl)

    if (popover) {
        const popoverEl = document.createElement('div')
        popoverEl.popover = 'auto'
        popoverEl.className = styles.popover

        const popoverContentEl = document.createElement('aside')
        popoverContentEl.className = clsx(styles.popoverContent, popoverClassName)
        popoverContentEl.append(popover)
        popoverEl.append(popoverContentEl)

        // DOM event listeners are automatically removed when the element is removed, so we don't
        // need to track these elsewhere for cleanup.
        let refCount = 0
        const showPopover = (): void => {
            refCount++

            // Need to call showPopover before getPopoverDimensions because it needs to be displayed
            // in order to calculate its dimensions.
            popoverEl.showPopover()

            const { top, left } = getPopoverDimensions(el, popoverEl)
            popoverEl.style.top = top
            popoverEl.style.left = left
        }
        const hidePopover = (): void => {
            refCount--
            if (refCount === 0) {
                popoverEl.hidePopover()
            }
        }
        headerEl.addEventListener('mouseenter', showPopover)
        headerEl.addEventListener('mouseleave', hidePopover)
        headerEl.addEventListener('focus', showPopover)
        headerEl.addEventListener('blur', hidePopover)
        popoverEl.addEventListener('mouseenter', showPopover)
        popoverEl.addEventListener('mouseleave', hidePopover)

        // Useful for debugging:
        //
        // setTimeout(() => showPopover())

        el.append(popoverEl)
    }

    return el
}
