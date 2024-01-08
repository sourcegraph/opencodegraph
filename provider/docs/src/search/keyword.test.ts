import { describe, expect, test } from 'vitest'
import { createCorpusArchive } from '../corpus/archive/corpusArchive.ts'
import { doc } from '../corpus/index/corpusIndex.test.ts'
import { createCorpusIndex } from '../corpus/index/corpusIndex.ts'
import { keywordSearch } from './keyword.ts'
import { calculateTFIDF } from './tfidf.ts'
import { type SearchResult } from './types.ts'

describe('keywordSearch', () => {
    test('finds matches', async () => {
        expect(
            keywordSearch(await createCorpusIndex(await createCorpusArchive([doc(1, 'aaa'), doc(2, 'bbb')])), {
                text: 'bbb',
            })
        ).toEqual<Omit<SearchResult, 'scores'>[]>([
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
