import {
    type Annotation,
    type AnnotationsParams,
    type AnnotationsResult,
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

    annotations(params: AnnotationsParams, settings: ProviderSettings): AnnotationsResult {
        const lines = params.content.split('\n')
        const annotations: Annotation[] = []
        for (const [i, line] of lines.entries()) {
            if (i % 10 !== 0) {
                continue
            }
            annotations.push({
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

        return annotations
    },
}

export default helloWorld
