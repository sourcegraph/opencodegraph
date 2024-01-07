import { describe, expect, test } from 'vitest'
import { type CorpusSearchResult } from '../client/client'
import { createCorpusArchive } from '../corpus/archive/corpusArchive'
import { indexCorpus } from '../corpus/index/corpusIndex'
import { doc } from '../corpus/index/corpusIndex.test'
import { keywordSearch } from './keyword'
import { calculateTFIDF } from './tfidf'

describe('keywordSearch', () => {
    test('finds matches', async () => {
        expect(
            keywordSearch(await indexCorpus(await createCorpusArchive([doc(1, 'aaa'), doc(2, 'bbb')])), { text: 'bbb' })
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
