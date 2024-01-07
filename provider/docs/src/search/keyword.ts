import { type CorpusIndex } from '../corpus/index/corpusIndex.ts'
import { terms } from './terms.ts'
import { computeTFIDF } from './tfidf.ts'
import { type Query, type SearchResult } from './types.ts'

export function keywordSearch(index: CorpusIndex, query: Query): Omit<SearchResult, 'scores'>[] {
    const queryTerms = terms(query.text).filter(term => term.length >= 3)

    const results: Omit<SearchResult, 'scores'>[] = []
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
