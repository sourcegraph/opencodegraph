import { type CorpusIndex, type CorpusSearchResult } from '..'
import { terms } from './terms'
import { createIndexForTFIDF } from './tfidf'

export function keywordSearch(index: CorpusIndex, query: string): CorpusSearchResult[] {
    const queryTerms = terms(query).filter(term => term.length >= 3)
    const tfidf = createIndexForTFIDF(index.docs)

    const results: CorpusSearchResult[] = []
    for (const { doc, chunks } of index.docs) {
        for (const [i, chunk] of chunks.entries()) {
            const score = queryTerms.reduce((score, term) => score + tfidf(term, doc.id, i), 0)
            if (score > 0) {
                results.push({ doc: doc.id, chunk: i, score, excerpt: chunk.text })
            }
        }
    }
    return results
}
