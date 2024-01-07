import { type CorpusIndex } from '../corpus/index/corpusIndex'
import { terms } from './terms'
import { computeTFIDF } from './tfidf'
import { type Query, type SearchResult } from './types'

export function keywordSearch(index: CorpusIndex, query: Query): SearchResult[] {
    const queryTerms = terms(query.text).filter(term => term.length >= 3)

    const results: SearchResult[] = []
    for (const {
        doc: { id: docID },
        chunks,
    } of index.docs) {
        for (const [i, chunk] of chunks.entries()) {
            const score = queryTerms.reduce((score, term) => score + computeTFIDF(term, docID, i, index.tfidf), 0)
            if (score > 0) {
                results.push({ doc: docID, chunk: i, score, scores: {}, excerpt: chunk.text })
            }
        }
    }
    return results
}
