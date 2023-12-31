import { type CorpusIndex, type CorpusSearchResult, type IndexedDoc } from '..'
import { memo, scopedCache } from '../cache/cache'
import { type SearchOptions } from './multi'
import { terms } from './terms'
import { computeTFIDF, createTFIDFIndex } from './tfidf'

export async function keywordSearch(
    index: CorpusIndex,
    query: string,
    { cache, logger }: SearchOptions
): Promise<CorpusSearchResult[]> {
    const queryTerms = terms(query).filter(term => term.length >= 3)
    const tfidfIndex = await cachedCreateIndexForTFIDF(index.docs, { cache: scopedCache(cache, 'tfidfIndex'), logger })

    const results: CorpusSearchResult[] = []
    for (const { doc, chunks } of index.docs) {
        for (const [i, chunk] of chunks.entries()) {
            const score = queryTerms.reduce((score, term) => score + computeTFIDF(term, doc.id, i, tfidfIndex), 0)
            if (score > 0) {
                results.push({ doc: doc.id, chunk: i, score, excerpt: chunk.text })
            }
        }
    }
    return results
}

async function cachedCreateIndexForTFIDF(
    docs: IndexedDoc[],
    { cache }: SearchOptions
): Promise<ReturnType<typeof createTFIDFIndex>> {
    const text = docs.map(doc => doc.chunks.map(chunk => chunk.text).join('\0')).join('\0\0')
    return memo(cache, text, 'tfidxIndex', () => Promise.resolve(createTFIDFIndex(docs)))
}
