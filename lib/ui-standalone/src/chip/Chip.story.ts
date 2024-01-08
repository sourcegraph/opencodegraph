import { type Item } from '@openctx/schema'
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

const FIXTURE_ITEM: Item = {
    title: '📘 Docs: CSS in client/web',
}

export const Text: StoryObj = { render: () => createChip({ item: { ...FIXTURE_ITEM } }) }

export const Link: StoryObj = {
    render: () => createChip({ item: { ...FIXTURE_ITEM, url: 'https://example.com' } }),
}

export const Detail: StoryObj = {
    render: () => createChip({ item: { ...FIXTURE_ITEM, ui: { detail: 'View doc page' } } }),
}

export const Image: StoryObj = {
    render: () =>
        createChip({
            item: {
                ...FIXTURE_ITEM,
                ui: {
                    detail: '<img src="https://lh3.googleusercontent.com/d_S5gxu_S1P6NR1gXeMthZeBzkrQMHdI5uvXrpn3nfJuXpCjlqhLQKH_hbOxTHxFhp5WugVOEcl4WDrv9rmKBDOMExhKU5KmmLFQVg" width=512 height=300 />',
                    format: 'markdown',
                },
            },
        }),
}
