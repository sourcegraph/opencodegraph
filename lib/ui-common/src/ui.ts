import { type Item, type Range } from '@openctx/schema'

export interface ItemWithRichRange<R extends Range> extends Omit<Item, 'range'> {
    range?: R
}

export interface ItemWithAdjustedRange<R extends Range> extends ItemWithRichRange<R> {
    originalRange?: R
}

/**
 * Applies presentation hints to items.
 */
export function prepareItemsForPresentation(items: Item[]): Item[]
export function prepareItemsForPresentation<R extends Range = Range>(
    items: ItemWithAdjustedRange<R>[],
    makeRange: (range: Range) => R
): ItemWithAdjustedRange<R>[]
export function prepareItemsForPresentation<R extends Range = Range>(
    items: ItemWithAdjustedRange<R>[],
    makeRange?: (range: Range) => R
): ItemWithAdjustedRange<R>[] {
    return items
        .map(item => {
            if (item.ui?.presentationHints?.includes('show-at-top-of-file')) {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                item = {
                    ...item,
                    originalRange: item.range,
                    range: makeRange ? makeRange(ZERO_RANGE) : ZERO_RANGE,
                } as ItemWithAdjustedRange<R>
            }
            return item
        })
        .toSorted((a, b) => (a.range?.start.line ?? 0) - (b.range?.start.line ?? 0))
}

const ZERO_RANGE: Range = { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }

/**
 * Group items that have the same `ui.group` value.
 */
export function groupItems<A extends Item>(
    items: A[]
): {
    groups: [string, A[]][]
    ungrouped: A[]
} {
    const groups: { [group: string]: A[] } = {}
    for (const item of items) {
        if (item.ui?.group) {
            if (!groups[item.ui.group]) {
                groups[item.ui.group] = []
            }
            groups[item.ui.group].push(item)
        }
    }
    for (const [group, items] of Object.entries(groups)) {
        if (items.length === 1) {
            delete groups[group]
        }

        // Ensure unique on (title, url).
        const seen = new Set<string>()
        groups[group] = items.filter(item => {
            const key = `${item.title}:${item.url}`
            if (seen.has(key)) {
                return false
            }
            seen.add(key)
            return true
        })
    }
    const ungrouped = items.filter(item => !item.ui?.group || !groups[item.ui.group])

    return { groups: Object.entries(groups).toSorted(([a], [b]) => a.localeCompare(b)), ungrouped }
}
