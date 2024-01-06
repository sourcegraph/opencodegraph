import type { Annotation } from '@opencodegraph/schema'
import { type Meta, type StoryObj } from '@storybook/react'
import { ChipList } from './ChipList'

const FIXTURE_ANNS: Annotation[] = [
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
        annotations: FIXTURE_ANNS.slice(0, 1) satisfies Annotation[],
    },
}

export const MultipleChips: Story = {
    args: {
        annotations: FIXTURE_ANNS satisfies Annotation[],
    },
}

export const Grouped: Story = {
    args: {
        annotations: [
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
            FIXTURE_ANNS[1],
        ] satisfies Annotation[],
    },
}
