import { type Item } from '@openctx/schema'
import { type FunctionComponent } from 'react'
import { BaseChip } from './BaseChip'
import styles from './Chip.module.css'

/**
 * A single OpenCtx item, displayed as a "chip".
 */
export const Chip: FunctionComponent<{
    item: Item
    className?: string
    popoverClassName?: string
}> = ({ item, className, popoverClassName }) => (
    <BaseChip
        title={item.title}
        url={item.url}
        className={className}
        popover={
            /* TODO(sqs): support markdown */
            item.ui?.detail ? <p className={styles.detail}>{item.ui?.detail}</p> : null
        }
        popoverClassName={popoverClassName}
    />
)
