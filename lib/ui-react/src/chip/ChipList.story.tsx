import type { Item } from '@openctx/schema'
import { type Meta, type StoryObj } from '@storybook/react'
import { ChipList } from './ChipList'

const FIXTURE_ITEMS: Item[] = [
    {
        title: '📘 Docs: CSS in client/web',
    },
    {
        title: '📟 http_request_queue (metric)',
    },
]

const meta: Meta<typeof ChipList> = {
    title: 'ChipList',
    component: ChipList,
    decorators: [
        story => <div style={{ maxWidth: '600px', margin: '2rem auto', border: 'solid 1px #ccc' }}>{story()}</div>,
    ],
}

export default meta

type Story = StoryObj<typeof ChipList>

export const SingleChip: Story = {
    args: {
        items: FIXTURE_ITEMS.slice(0, 1) satisfies Item[],
    },
}

export const MultipleChips: Story = {
    args: {
        items: FIXTURE_ITEMS satisfies Item[],
    },
}

export const Grouped: Story = {
    args: {
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
        ] satisfies Item[],
    },
}
