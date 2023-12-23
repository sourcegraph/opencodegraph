import { describe, expect, test } from 'vitest'
import { indexCorpus } from '..'
import { corpusData } from '../data'
import { calculateTFIDF, createIndexForTFIDF } from './tfidf'

describe('createIndexForTFIDF', async () => {
    const data = corpusData([
        { id: 1, text: 'a b c c c' },
        { id: 2, text: 'b c d' },
        { id: 3, text: 'c d e' },
    ])
    const docIDs = data.docs.map(({ id }) => id)
    const index = await indexCorpus(data)
    const tfidf = createIndexForTFIDF(index.docs)

    test('term in 1 doc', () => {
        expect(docIDs.map(docID => tfidf('a', docID, 0))).toEqual([
            calculateTFIDF({ termOccurrencesInChunk: 1, chunkTermLength: 5, totalChunks: 3, termChunkFrequency: 1 }),
            0,
            0,
        ])
    })

    test('term in all docs', () => {
        expect(docIDs.map(docID => tfidf('c', docID, 0))).toEqual([
            calculateTFIDF({ termOccurrencesInChunk: 3, chunkTermLength: 5, totalChunks: 3, termChunkFrequency: 3 }),
            calculateTFIDF({ termOccurrencesInChunk: 1, chunkTermLength: 3, totalChunks: 3, termChunkFrequency: 3 }),
            calculateTFIDF({ termOccurrencesInChunk: 1, chunkTermLength: 3, totalChunks: 3, termChunkFrequency: 3 }),
        ])
    })

    test('unknown term', () => {
        expect(docIDs.map(docID => tfidf('x', docID, 0))).toEqual([0, 0, 0])
    })
})
