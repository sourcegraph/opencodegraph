import { type CorpusSearchResult, type Query } from '..'
import { type CorpusIndex } from '../index/corpusIndex'
import { terms } from './terms'
import { computeTFIDF } from './tfidf'

export function keywordSearch(index: CorpusIndex, query: Query): CorpusSearchResult[] {
    const queryTerms = terms(query.text).filter(term => term.length >= 3)

    const results: CorpusSearchResult[] = []
    for (const {
        doc: { id: docID },
        chunks,
    } of index.docs) {
        for (const [i, chunk] of chunks.entries()) {
            const score = queryTerms.reduce((score, term) => score + computeTFIDF(term, docID, i, index.tfidf), 0)
            if (score > 0) {
                results.push({ doc: docID, chunk: i, score, excerpt: chunk.text })
            }
        }
    }
    return results
}
