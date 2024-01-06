import { type Annotation } from '@opencodegraph/schema'
import { type FunctionComponent } from 'react'
import { BaseChip } from './BaseChip'
import styles from './ChipGroup.module.css'

export const ChipGroup: FunctionComponent<{
    group: string
    annotations: Annotation[]
    className?: string
    popoverClassName?: string
}> = ({ group, annotations, className, popoverClassName }) => (
    <BaseChip
        title={group}
        className={className}
        popover={<ChipList annotations={annotations} />}
        popoverClassName={popoverClassName}
    />
)

const ChipList: FunctionComponent<{ annotations: Annotation[] }> = ({ annotations }) => (
    <ul className={styles.list}>
        {annotations.map((ann, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <ChipListItem key={i} annotation={ann} />
        ))}
    </ul>
)

const ChipListItem: FunctionComponent<{ annotation: Annotation }> = ({ annotation }) => (
    <li key={annotation.title} tabIndex={-1}>
        {annotation.url ? (
            <a title={annotation.ui?.detail} href={annotation.url} className={styles.listItemLink}>
                {annotation.title}
            </a>
        ) : (
            <span title={annotation.ui?.detail}>{annotation.title}</span>
        )}
    </li>
)
