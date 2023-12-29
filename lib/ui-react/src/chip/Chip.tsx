import { type Annotation } from '@opencodegraph/schema'
import classNames from 'classnames'
import React, { useCallback, useRef, useState } from 'react'
import styles from './Chip.module.css'
import { Popover } from './Popover'

/**
 * A single OpenCodeGraph annotation, displayed as a "chip".
 */
export const Chip: React.FunctionComponent<{
    ann: Annotation
    className?: string
    popoverClassName?: string
}> = ({ ann, className, popoverClassName }) => {
    const hasDetail = Boolean(ann.ui?.detail)

    const [popoverVisible, setPopoverVisible] = useState(false)
    const showPopover = useCallback((): void => setPopoverVisible(true), [])
    const hidePopover = useCallback((): void => setPopoverVisible(false), [])

    const anchorRef = useRef<HTMLElement>(null)

    // TODO(sqs): handle no title

    return (
        <aside className={classNames(styles.chip, className)} ref={anchorRef}>
            <header onMouseEnter={showPopover} onMouseLeave={hidePopover} onFocus={showPopover} onBlur={hidePopover}>
                <h4 className={styles.title}>{ann.title}</h4>
                {ann.url && <a className={styles.stretchedLink} aria-hidden={true} href={ann.url} />}
            </header>
            {hasDetail && anchorRef.current && (
                <Popover anchor={anchorRef.current} visible={popoverVisible}>
                    <aside className={classNames(styles.popoverContent, popoverClassName)}>
                        {/* TODO(sqs): markdown */}
                        {ann.ui?.detail}
                    </aside>
                </Popover>
            )}
        </aside>
    )
}

/**
 * A list of OpenCodeGraph chips.
 */
export const ChipList: React.FunctionComponent<{
    annotations: Annotation[]
    className?: string
    chipClassName?: string
    popoverClassName?: string
}> = ({ annotations, className, chipClassName, popoverClassName }) => (
    <div className={classNames(styles.list, className)}>
        {annotations.map((ann, i) => (
            <Chip key={ann.url ?? i} ann={ann} className={chipClassName} popoverClassName={popoverClassName} />
        ))}
    </div>
)
