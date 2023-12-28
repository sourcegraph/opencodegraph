import { type Item } from '@opencodegraph/schema'
import type { Meta, StoryObj } from '@storybook/html'
import { createItemChip } from './ItemChip'

const meta: Meta = {
    title: 'ItemChip',
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

export const Text: StoryObj = { render: () => createItemChip({ item: FIXTURE_ITEM }) }

export const Link: StoryObj = {
    render: () => createItemChip({ item: { ...FIXTURE_ITEM, url: 'https://example.com' } }),
}

export const Detail: StoryObj = {
    render: () => createItemChip({ item: { ...FIXTURE_ITEM, detail: 'View doc page' } }),
}

export const Image: StoryObj = {
    render: () =>
        createItemChip({
            item: {
                ...FIXTURE_ITEM,
                image: {
                    url: 'https://lh3.googleusercontent.com/d_S5gxu_S1P6NR1gXeMthZeBzkrQMHdI5uvXrpn3nfJuXpCjlqhLQKH_hbOxTHxFhp5WugVOEcl4WDrv9rmKBDOMExhKU5KmmLFQVg',
                    width: 512,
                    height: 300,
                },
            },
        }),
}
