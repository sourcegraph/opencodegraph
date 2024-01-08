import { type AnnotationsResult } from '@openctx/provider'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'
import storybook, { __test__, type Settings } from './index'

describe('storybook', () => {
    const SETTINGS: Settings = {
        storybookUrl: 'https://<branch>--abc123.chromatic.com/',
    }

    test('capabilities', async () => {
        expect(await storybook.capabilities({}, SETTINGS)).toBeDefined()
    })

    const fetchMocker = createFetchMock(vi)
    beforeAll(() => fetchMocker.enableMocks())
    afterEach(() => fetchMocker.resetMocks())
    afterAll(() => fetchMocker.disableMocks())

    describe('annotations', () => {
        test('story file', async () => {
            __test__.suppressConsoleLog = true
            __test__.skipRewriteForOEmbed = true
            afterEach(() => {
                __test__.suppressConsoleLog = false
                __test__.skipRewriteForOEmbed = false
            })

            fetchMocker.mockResponses(
                JSON.stringify({
                    title: 'chromatic-oembed-image',
                    thumbnail_url: 'https://example.com/thumbnail.png',
                    thumbnail_width: 400,
                    thumbnail_height: 300,
                }),
                ['404 Not Found', { status: 404 }]
            )
            expect(
                await storybook.annotations(
                    {
                        file: 'file:///a/b.story.tsx',
                        content: `
const config: Meta = {
    title: 'a/b',
}

export const Foo: Story = {}

export const Bar: Story = {}
`,
                    },
                    SETTINGS
                )
            ).toEqual<AnnotationsResult>([
                {
                    title: '🖼️ Storybook: a/b/Foo',
                    url: 'https://main--abc123.chromatic.com/?path=%2Fstory%2Fa-b--foo',
                    ui: {
                        detail: '<img src="https://example.com/thumbnail.png" alt="chromatic-oembed-image" width="400" height="300" />',
                        format: 'markdown',
                    },
                    range: {
                        start: { line: 5, character: 13 },
                        end: { line: 5, character: 16 },
                    },
                },
                {
                    title: '🖼️ Storybook: a/b/Bar',
                    url: 'https://main--abc123.chromatic.com/?path=%2Fstory%2Fa-b--bar',
                    range: {
                        start: { line: 7, character: 13 },
                        end: { line: 7, character: 16 },
                    },
                },
            ])
        })
    })
})
