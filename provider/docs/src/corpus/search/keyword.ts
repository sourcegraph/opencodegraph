import { type CorpusIndex, type CorpusSearchResult, type Query } from '..'
import { terms } from './terms'
import { computeTFIDF } from './tfidf'

export function keywordSearch(index: CorpusIndex, query: Query): CorpusSearchResult[] {
    console.time('kw' + query.text.length)

    const queryTerms = terms(query.text).filter(term => term.length >= 3)

    const results: CorpusSearchResult[] = []
    for (const { doc, chunks } of index.docs) {
        for (const [i, chunk] of chunks.entries()) {
            const score = queryTerms.reduce((score, term) => score + computeTFIDF(term, doc.id, i, index.tfidf), 0)
            if (score > 0) {
                results.push({ doc: doc.id, chunk: i, score, excerpt: chunk.text })
            }
        }
    }
    console.timeEnd('kw' + query.text.length)
    return results
}
