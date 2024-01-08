import type { Item } from '@openctx/schema'
import { type Meta, type StoryObj } from '@storybook/html'
import { createChipList } from './ChipList'

const FIXTURE_ITEMS: Item[] = [
    {
        title: '📘 Docs: CSS in client/web',
    },
    {
        title: '📟 http_request_queue (metric)',
    },
]

const meta: Meta = {
    title: 'ChipList',
    decorators: [
        story => {
            const container = document.createElement('div')
            container.style.maxWidth = '600px'
            container.style.margin = '2rem auto'
            container.style.border = 'solid 1px #ccc'
            container.append(story())
            return container
        },
    ],
}

export default meta

export const SingleChip: StoryObj = {
    render: () =>
        createChipList({
            items: FIXTURE_ITEMS.slice(0, 1),
        }),
}

export const MultipleChips: StoryObj = {
    render: () =>
        createChipList({
            items: FIXTURE_ITEMS,
        }),
}

export const Grouped: StoryObj = {
    render: () =>
        createChipList({
            items: [
                {
                    title: '📘 Docs: Page 1',
                    url: 'https://example.com/1',
                    ui: { detail: 'Detail 1', group: 'Docs' },
                },
                {
                    title: '📘 Docs: Page 2',
                    url: 'https://example.com/2',
                    ui: { group: 'Docs' },
                },
                {
                    title: '📘 Docs: Page 3',
                    url: 'https://example.com/3',
                    ui: { group: 'Docs' },
                },
                FIXTURE_ITEMS[1],
            ],
        }),
}
