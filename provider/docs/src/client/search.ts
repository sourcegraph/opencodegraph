import { type ChunkIndex } from '../corpus/doc/chunks'
import { type DocID } from '../corpus/doc/doc'
import { type CorpusIndex } from '../corpus/index/corpusIndex'
import { type Logger } from '../logger'
import { embeddingsSearch } from '../search/embeddings'
import { keywordSearch } from '../search/keyword'
import { type Query, type SearchResult } from '../search/types'

export interface SearchOptions {
    logger?: Logger
}

/**
 * Search using multiple search methods.
 */
export async function search(index: CorpusIndex, query: Query, { logger }: SearchOptions): Promise<SearchResult[]> {
    const allResults = await Promise.all(
        Object.entries(SEARCH_METHODS).map(async ([name, searchFn]) => {
            const t0 = performance.now()
            const results = await searchFn(index, query)
            logger?.(`search[${name}] took ${Math.round(performance.now() - t0)}ms`)
            return [name, results] as [string, SearchResult[]]
        })
    )

    // Sum scores for each chunk.
    const combinedResults = new Map<DocID, Map<ChunkIndex, SearchResult>>()
    for (const [searchMethod, results] of allResults) {
        for (const result of results) {
            let docResults = combinedResults.get(result.doc)
            if (!docResults) {
                docResults = new Map<ChunkIndex, SearchResult>()
                combinedResults.set(result.doc, docResults)
            }

            const chunkResult: SearchResult = docResults.get(result.chunk) ?? {
                doc: result.doc,
                chunk: result.chunk,
                score: 0,
                scores: {},
                excerpt: result.excerpt,
            }

            // HACK: TF-IDF scores are lower than embeddings scores, so boost.
            const scoreBoostFactor = searchMethod === 'keywordSearch' ? 4 : 1
            const adjustedScore = result.score * scoreBoostFactor

            docResults.set(result.chunk, {
                ...chunkResult,
                score: chunkResult.score + adjustedScore,
                scores: { ...chunkResult.scores, [searchMethod]: adjustedScore },
            })
        }
    }

    const results = Array.from(combinedResults.values()).flatMap(docResults => Array.from(docResults.values()))
    const MIN_SCORE = 0.001
    return results.filter(s => s.score >= MIN_SCORE).toSorted((a, b) => b.score - a.score)
}

const SEARCH_METHODS: Record<
    string,
    (index: CorpusIndex, query: Query) => Omit<SearchResult, 'scores'>[] | Promise<Omit<SearchResult, 'scores'>[]>
> = {
    keywordSearch,
    embeddingsSearch,
}
