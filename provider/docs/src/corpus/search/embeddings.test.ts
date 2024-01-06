import { describe, expect, test } from 'vitest'
import { indexCorpus, type CorpusSearchResult } from '..'
import { createCorpusArchive } from '../archive/corpusArchive'
import { doc } from '../index.test'
import { embeddingsSearch, embedTextInThisScope, similarity } from './embeddings'

describe('embeddingsSearch', () => {
    test('finds matches', async () => {
        expect(
            await embeddingsSearch(await indexCorpus(await createCorpusArchive([doc(1, 'xxxxxx'), doc(2, 'b')])), {
                text: 'b',
            })
        ).toEqual<CorpusSearchResult[]>([{ doc: 2, chunk: 0, score: 1, excerpt: 'b' }])
    })
})

describe('embedText', () => {
    test('embeds', async () => {
        const s = await embedTextInThisScope('hello world')
        expect(s).toBeInstanceOf(Float32Array)
    })
})

describe('similarity', () => {
    test('works', async () => {
        expect(await similarity('what is the current time', 'what time is it')).toBeCloseTo(0.7217, 4)
        expect(await similarity('hello world', 'seafood')).toBeCloseTo(0.2025, 4)
    })
})
