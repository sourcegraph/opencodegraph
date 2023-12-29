import { Annotation } from '@opencodegraph/schema'
import type { Meta, StoryObj } from '@storybook/html'
import { createChip } from './Chip'

const meta: Meta = {
    title: 'Chip',
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

const FIXTURE_ANN: Annotation = {
    title: '📘 Docs: CSS in client/web',
}

export const Text: StoryObj = { render: () => createChip({ annotation: { ...FIXTURE_ANN } satisfies Annotation }) }

export const Link: StoryObj = {
    render: () => createChip({ annotation: { ...FIXTURE_ANN, url: 'https://example.com' } satisfies Annotation }),
}

export const Detail: StoryObj = {
    render: () => createChip({ annotation: { ...FIXTURE_ANN, ui: { detail: 'View doc page' } } satisfies Annotation }),
}

export const Image: StoryObj = {
    render: () =>
        createChip({
            annotation: {
                ...FIXTURE_ANN,
                ui: {
                    detail: '<img src="https://lh3.googleusercontent.com/d_S5gxu_S1P6NR1gXeMthZeBzkrQMHdI5uvXrpn3nfJuXpCjlqhLQKH_hbOxTHxFhp5WugVOEcl4WDrv9rmKBDOMExhKU5KmmLFQVg" width=512 height=300 />',
                    format: 'markdown',
                },
            } satisfies Annotation,
        }),
}
