import { describe, expect, test } from 'vitest'
import { chunk, type Chunk } from './chunks'

describe('chunker', () => {
    test('empty', () => expect(chunk('', {})).toEqual<Chunk[]>([]))

    test('fallback', () => expect(chunk('a', {})).toEqual<Chunk[]>([{ range: { start: 0, end: 1 }, text: 'a' }]))

    describe('Markdown', () => {
        test('by section', () =>
            expect(
                chunk(
                    `
# Title

Intro

## Section 1

Body 1

## Section 2

Body 2
`.trim(),
                    { isMarkdown: true }
                )
            ).toEqual<Chunk[]>([
                {
                    range: {
                        start: 2,
                        end: 16,
                    },
                    text: 'Title\n\nIntro',
                },
                {
                    range: {
                        start: 5,
                        end: 24,
                    },
                    text: 'Section 1\n\nBody 1',
                },
                {
                    range: {
                        start: 8,
                        end: 25,
                    },
                    text: 'Section 2\n\nBody 2',
                },
            ]))
    })
})
