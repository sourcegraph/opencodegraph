import { describe, expect, test } from 'vitest'
import { extractContentUsingMozillaReadability, type Content } from './contentExtractor'

describe('extractContentUsingMozillaReadability', () => {
    test('extracts content', async () =>
        expect(
            await extractContentUsingMozillaReadability.extractContent({
                id: 1,
                text: '<html><head><title>Bar - MySite</title></head><body><aside><nav><h1><a href="/">MySite</a></h1> <a href="/foo">foo</a></nav></aside><main><h1>Bar</h1>\n<p>Baz</p></main></body>',
            })
        ).toEqual<Content>({
            title: 'Bar - MySite',
            content: '<div id="readability-page-1" class="page"><main><h2>Bar</h2>\n<p>Baz</p></main></div>',
            textContent: 'Bar\nBaz',
        }))
})
