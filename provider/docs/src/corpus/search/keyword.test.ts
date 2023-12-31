import { describe, expect, test } from 'vitest'
import { indexCorpus, type CorpusSearchResult } from '..'
import { noopCache } from '../cache/cache'
import { corpusData } from '../data'
import { doc } from '../index.test'
import { keywordSearch } from './keyword'
import { calculateTFIDF } from './tfidf'

describe('keywordSearch', () => {
    test('finds matches', async () => {
        expect(
            await keywordSearch(await indexCorpus(corpusData([doc(1, 'aaa'), doc(2, 'bbb')])), 'bbb', {
                cache: noopCache,
            })
        ).toEqual<CorpusSearchResult[]>([
            {
                doc: 2,
                chunk: 0,
                score: calculateTFIDF({
                    termOccurrencesInChunk: 1,
                    chunkTermLength: 1,
                    totalChunks: 2,
                    termChunkFrequency: 1,
                }),
                excerpt: 'bbb',
            },
        ])
    })
})
