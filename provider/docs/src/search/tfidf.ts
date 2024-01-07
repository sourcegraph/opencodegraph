import { type ChunkIndex } from '../corpus/doc/chunks'
import { type DocID } from '../corpus/doc/doc'
import { type IndexedDoc } from '../corpus/index/corpusIndex'
import { terms, type Term } from './terms'

/**
 * Index the corpus for fast computation of TF-IDF.
 *
 * TF-IDF is a way of measuring the relevance of a term to a document in a corpus. See
 * https://en.wikipedia.org/wiki/Tf%E2%80%93idf.
 *
 * TF-IDF = TF * IDF
 * - TF = number of occurrences of term in the chunk / number of (non-unique) terms in the chunk
 * - IDF = log(number of chunks / number of chunks containing the term)
 */
export function createTFIDFIndex(docs: IndexedDoc[]): TFIDFIndex {
    /**
     * DocID -> chunk index -> term -> number of occurrences of term in the chunk.
     *
     * "TF" in "TF-IDF" (with chunks instead of documents as the unit of analysis).
     */
    const termFrequency: Record<Term, number>[][] = []

    /**
     * DocID -> chunk index -> number of (non-unique) terms in the chunk.
     */
    const termLength: number[][] = []

    /**
     * Term -> number of chunks containing the term.
     *
     * "DF" in "IDF" in "TF-IDF" (with chunks instead of documents as the unit of analysis).
     */
    const chunkFrequency: Record<Term, number> = {}

    let totalChunks = 0

    for (const {
        doc: { id: docID },
        chunks,
    } of docs) {
        const docTermFrequency: Record<Term, number>[] = new Array<Record<Term, number>>(chunks.length)
        termFrequency[docID] = docTermFrequency

        const docTermLength: number[] = new Array<number>(chunks.length)
        termLength[docID] = docTermLength

        for (const [i, chunk] of chunks.entries()) {
            const chunkTerms = terms(chunk.text)

            // Set chunk frequencies.
            for (const uniqueTerm of new Set<Term>(chunkTerms).values()) {
                chunkFrequency[uniqueTerm] = (chunkFrequency[uniqueTerm] ?? 0) + 1
            }

            // Set term frequencies.
            const chunkTermFrequency: Record<Term, number> = {}
            docTermFrequency[i] = chunkTermFrequency
            for (const term of chunkTerms) {
                chunkTermFrequency[term] = (chunkTermFrequency[term] ?? 0) + 1
            }

            // Set term cardinality.
            docTermLength[i] = chunkTerms.length

            // Increment total chunks.
            totalChunks++
        }
    }

    return {
        termFrequency,
        termLength,
        totalChunks,
        chunkFrequency,
    }
}

/**
 * An index that can be used to compute TF-IDF for a term. Create the index with
 * {@link createTFIDFIndex}.
 */
export interface TFIDFIndex {
    termFrequency: Record<Term, number>[][]
    termLength: number[][]
    totalChunks: number
    chunkFrequency: Record<Term, number>
}

/**
 * Compute the TF-IDF for a term in a document chunk using an index created by
 * {@link createTFIDFIndex}.
 */
export function computeTFIDF(term: Term, doc: DocID, chunk: ChunkIndex, index: TFIDFIndex): number {
    const docTermLength = index.termLength[doc]
    if (!docTermLength) {
        throw new Error(`doc ${doc} not found in termLength`)
    }
    if (typeof docTermLength[chunk] !== 'number') {
        throw new TypeError(`chunk ${chunk} not found in termLength for doc ${doc}`)
    }

    const docTermFrequency = index.termFrequency[doc]
    if (!docTermFrequency) {
        throw new Error(`doc ${doc} not found in termFrequency`)
    }
    if (typeof docTermFrequency[chunk] !== 'object') {
        throw new TypeError(`chunk ${chunk} not found in termFrequency for doc ${doc}`)
    }

    return calculateTFIDF({
        termOccurrencesInChunk: docTermFrequency[chunk][term] ?? 0,
        chunkTermLength: docTermLength[chunk],
        totalChunks: index.totalChunks,
        termChunkFrequency: index.chunkFrequency[term] ?? 0,
    })
}

export type TFIDF = (term: Term, doc: DocID, chunk: ChunkIndex) => number

/**
 * Calculate TF-IDF given the formula inputs. @see {createTFIDFIndex}
 *
 * Use {@link createTFIDFIndex} instead of calling this directly.
 */
export function calculateTFIDF({
    termOccurrencesInChunk,
    chunkTermLength,
    totalChunks,
    termChunkFrequency,
}: {
    termOccurrencesInChunk: number
    chunkTermLength: number
    totalChunks: number
    termChunkFrequency: number
}): number {
    return (termOccurrencesInChunk / chunkTermLength) * Math.log((1 + totalChunks) / (1 + termChunkFrequency))
}
