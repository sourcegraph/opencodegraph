import { describe, expect, test } from 'vitest'
import { indexCorpus } from '..'
import { createCorpusArchive } from '../archive/corpusArchive'
import { calculateTFIDF, computeTFIDF, createTFIDFIndex } from './tfidf'

describe('createTFIDFIndex', async () => {
    const data = await createCorpusArchive([
        { id: 1, text: 'aa b c c c' },
        { id: 2, text: 'b c d' },
        { id: 3, text: 'c d e' },
    ])
    const docIDs = data.docs.map(({ id }) => id)
    const index = await indexCorpus(data)
    const tfidfIndex = createTFIDFIndex(index.docs)

    test('term in 1 doc', () => {
        expect(docIDs.map(docID => computeTFIDF('aa', docID, 0, tfidfIndex))).toEqual([
            calculateTFIDF({ termOccurrencesInChunk: 1, chunkTermLength: 5, totalChunks: 3, termChunkFrequency: 1 }),
            0,
            0,
        ])
    })

    test('term in all docs', () => {
        expect(docIDs.map(docID => computeTFIDF('c', docID, 0, tfidfIndex))).toEqual([
            calculateTFIDF({ termOccurrencesInChunk: 3, chunkTermLength: 5, totalChunks: 3, termChunkFrequency: 3 }),
            calculateTFIDF({ termOccurrencesInChunk: 1, chunkTermLength: 3, totalChunks: 3, termChunkFrequency: 3 }),
            calculateTFIDF({ termOccurrencesInChunk: 1, chunkTermLength: 3, totalChunks: 3, termChunkFrequency: 3 }),
        ])
    })

    test('unknown term', () => {
        expect(docIDs.map(docID => computeTFIDF('x', docID, 0, tfidfIndex))).toEqual([0, 0, 0])
    })
})
