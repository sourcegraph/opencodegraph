import { type Annotation } from '@opencodegraph/schema'
import { groupAnnotations } from '@opencodegraph/ui-common'
import clsx from 'clsx'
import { type FunctionComponent } from 'react'
import { Chip } from './Chip'
import { ChipGroup } from './ChipGroup'
import styles from './ChipList.module.css'

/**
 * A list of OpenCodeGraph annotations (displayed as "chips").
 *
 * If multiple annotations share a `ui.group` value, then the annotations will be grouped.
 */
export const ChipList: FunctionComponent<{
    annotations: Annotation[]
    className?: string
    chipClassName?: string
    popoverClassName?: string
}> = ({ annotations, className, chipClassName, popoverClassName }) => {
    const { groups, ungrouped } = groupAnnotations(annotations)
    return (
        <div className={clsx(styles.list, className)}>
            {groups.map(([group, anns]) => (
                <ChipGroup
                    key={`g:${group}`}
                    group={group}
                    annotations={anns}
                    className={chipClassName}
                    popoverClassName={popoverClassName}
                />
            ))}
            {ungrouped.map((annotation, i) => (
                <Chip
                    key={`u:${annotation.url ?? i}`}
                    annotation={annotation}
                    className={chipClassName}
                    popoverClassName={popoverClassName}
                />
            ))}
        </div>
    )
}
