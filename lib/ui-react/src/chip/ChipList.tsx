import { type Annotation } from '@opencodegraph/schema'
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
    // Handle groups.
    const groups: { [group: string]: Annotation[] } = {}
    for (const ann of annotations) {
        if (ann.ui?.group) {
            if (!groups[ann.ui.group]) {
                groups[ann.ui.group] = []
            }
            groups[ann.ui.group].push(ann)
        }
    }
    for (const [group, anns] of Object.entries(groups)) {
        if (anns.length === 1) {
            delete groups[group]
        }
    }
    const ungroupedAnns = annotations.filter(ann => !ann.ui?.group || !groups[ann.ui.group])

    return (
        <div className={clsx(styles.list, className)}>
            {Object.entries(groups).map(([group, anns]) => (
                <ChipGroup
                    key={`g:${group}`}
                    group={group}
                    annotations={anns}
                    className={chipClassName}
                    popoverClassName={popoverClassName}
                />
            ))}
            {ungroupedAnns.map((annotation, i) => (
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
