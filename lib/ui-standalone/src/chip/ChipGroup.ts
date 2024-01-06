import { type Annotation } from '@opencodegraph/schema'
import { createBaseChip } from './BaseChip'
import styles from './ChipGroup.module.css'

export function createChipGroup({
    group,
    annotations,
    className,
    popoverClassName,
}: {
    group: string
    annotations: Annotation[]
    className?: string
    popoverClassName?: string
}): HTMLElement {
    return createBaseChip({ title: group, className, popover: createChipList(annotations), popoverClassName })
}

function createChipList(annotations: Annotation[]): HTMLElement {
    const el = document.createElement('ul')
    el.className = styles.list
    for (const ann of annotations) {
        el.append(createChipListItem(ann))
    }
    return el
}

function createChipListItem(annotation: Annotation): HTMLElement {
    const el = document.createElement('li')
    el.tabIndex = -1

    if (annotation.url) {
        const linkEl = document.createElement('a')
        linkEl.title = annotation.ui?.detail ?? ''
        linkEl.href = annotation.url
        linkEl.className = styles.listItemLink
        linkEl.innerText = annotation.title
        el.append(linkEl)
    } else {
        const spanEl = document.createElement('span')
        spanEl.title = annotation.ui?.detail ?? ''
        spanEl.innerText = annotation.title
        el.append(spanEl)
    }

    return el
}
