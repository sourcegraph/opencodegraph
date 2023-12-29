import { getPopoverDimensions } from '@opencodegraph/ui-standalone'
import { useCallback, useEffect, useRef, type FunctionComponent, type ReactNode } from 'react'
import styles from './Popover.module.css'

/**
 * A popover that uses the HTML popover API.
 */
export const Popover: FunctionComponent<{
    anchor: HTMLElement
    visible: boolean
    children: ReactNode
}> = ({ anchor, visible, children }) => {
    const popoverEl = useRef<HTMLDivElement>(null)

    const showPopover = useCallback((): void => {
        if (!popoverEl.current) {
            return
        }

        // Need to call showPopover before getPopoverDimensions because it needs to be displayed in
        // order to calculate its dimensions.
        popoverEl.current.showPopover()

        const { top, left } = getPopoverDimensions(anchor, popoverEl.current)
        popoverEl.current.style.top = top
        popoverEl.current.style.left = left
    }, [anchor])
    const hidePopover = useCallback((): void => {
        if (!popoverEl.current) {
            return
        }
        popoverEl.current.hidePopover()
    }, [])

    useEffect(() => {
        if (visible) {
            showPopover()
        } else {
            hidePopover()
        }
    }, [hidePopover, showPopover, visible])

    return (
        // eslint-disable-next-line react/no-unknown-property
        <div popover="auto" ref={popoverEl} className={styles.popover}>
            {children}
        </div>
    )
}

// @types/react does not include the HTML popover attribute.
declare module 'react' {
    interface HTMLAttributes<T> {
        popover?: 'auto'
    }
}
