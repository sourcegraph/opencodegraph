import type { Annotation } from '@openctx/schema'
import { type Meta, type StoryObj } from '@storybook/react'
import { Chip } from './Chip'

const FIXTURE_ANN: Annotation = {
    title: '📘 Docs: CSS in client/web',
}

const meta: Meta<typeof Chip> = {
    title: 'Chip',
    component: Chip,
    decorators: [
        story => <div style={{ maxWidth: '600px', margin: '2rem auto', border: 'solid 1px #ccc' }}>{story()}</div>,
    ],
}

export default meta

type Story = StoryObj<typeof Chip>

export const Text: Story = {
    args: {
        annotation: { ...FIXTURE_ANN } satisfies Annotation,
    },
}

export const Link: Story = {
    args: {
        annotation: { ...FIXTURE_ANN, url: 'https://example.com' } satisfies Annotation,
    },
}

export const Detail: Story = {
    args: {
        annotation: { ...FIXTURE_ANN, ui: { detail: 'View doc page' } } satisfies Annotation,
    },
}

export const Image: Story = {
    args: {
        annotation: {
            ...FIXTURE_ANN,
            ui: {
                detail: '<img src="https://lh3.googleusercontent.com/d_S5gxu_S1P6NR1gXeMthZeBzkrQMHdI5uvXrpn3nfJuXpCjlqhLQKH_hbOxTHxFhp5WugVOEcl4WDrv9rmKBDOMExhKU5KmmLFQVg" width=512 height=300 />',
                format: 'markdown',
            },
        } satisfies Annotation,
    },
}
