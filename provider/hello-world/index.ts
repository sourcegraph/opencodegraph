import {
    type Item,
    type ItemsParams,
    type ItemsResult,
    type CapabilitiesParams,
    type CapabilitiesResult,
    type Provider,
    type ProviderSettings,
} from '@openctx/provider'

/**
 * A demo [OpenCtx](https://openctx.org) provider that annotates every 10th line in every
 * file with "✨ Hello, world!".
 */
const helloWorld: Provider = {
    capabilities(params: CapabilitiesParams, settings: ProviderSettings): CapabilitiesResult {
        return {}
    },

    items(params: ItemsParams, settings: ProviderSettings): ItemsResult {
        const lines = params.content.split('\n')
        const items: Item[] = []
        for (const [i, line] of lines.entries()) {
            if (i % 10 !== 0) {
                continue
            }
            items.push({
                title: '✨ Hello, world!',
                url: 'https://openctx.org',
                ui: {
                    detail: 'From OpenCtx',
                },
                range: {
                    start: { line: i, character: 0 },
                    end: { line: i, character: line.length },
                },
            })
        }

        return items
    },
}

export default helloWorld
