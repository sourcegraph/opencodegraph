import { describe, expect, test } from 'vitest'
import { createCorpusArchive } from '../corpus/archive/corpusArchive'
import { createCorpusIndex } from '../corpus/index/corpusIndex'
import { doc } from '../corpus/index/corpusIndex.test'
import { keywordSearch } from './keyword'
import { calculateTFIDF } from './tfidf'
import { type SearchResult } from './types'

describe('keywordSearch', () => {
    test('finds matches', async () => {
        expect(
            keywordSearch(await createCorpusIndex(await createCorpusArchive([doc(1, 'aaa'), doc(2, 'bbb')])), {
                text: 'bbb',
            })
        ).toEqual<SearchResult[]>([
            {
                doc: 2,
                chunk: 0,
                score: calculateTFIDF({
                    termOccurrencesInChunk: 1,
                    chunkTermLength: 1,
                    totalChunks: 2,
                    termChunkFrequency: 1,
                }),
                scores: {},
                excerpt: 'bbb',
            },
        ])
    })
})
