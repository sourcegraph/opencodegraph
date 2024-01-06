import { type Annotation } from '@opencodegraph/schema'
import { type FunctionComponent } from 'react'
import { BaseChip } from './BaseChip'
import styles from './Chip.module.css'

/**
 * A single OpenCodeGraph annotation, displayed as a "chip".
 */
export const Chip: FunctionComponent<{
    annotation: Annotation
    className?: string
    popoverClassName?: string
}> = ({ annotation, className, popoverClassName }) => (
    <BaseChip
        title={annotation.title}
        url={annotation.url}
        className={className}
        popover={
            /* TODO(sqs): support markdown */
            annotation.ui?.detail ? <p className={styles.detail}>{annotation.ui?.detail}</p> : null
        }
        popoverClassName={popoverClassName}
    />
)
