import { scopedCache, type Cache } from '../corpus/cache/cache'
import { type ChunkIndex } from '../corpus/doc/chunks'
import { type DocID } from '../corpus/doc/doc'
import { type CorpusIndex } from '../corpus/index/corpusIndex'
import { type Logger } from '../logger'
import { embeddingsSearch } from '../search/embeddings'
import { keywordSearch } from '../search/keyword'
import { type CorpusSearchResult, type Query } from './client'

export interface SearchOptions {
    cache: Cache
    logger?: Logger
}

/**
 * Search using multiple search methods.
 */
export async function multiSearch(
    index: CorpusIndex,
    query: Query,
    { cache, logger }: SearchOptions
): Promise<CorpusSearchResult[]> {
    const allResults = (
        await Promise.all(
            Object.entries(SEARCH_METHODS).map(async ([name, searchFn]) => {
                const t0 = performance.now()
                const results = await searchFn(index, query, { cache: scopedCache(cache, name), logger })
                logger?.(`search[${name}] took ${Math.round(performance.now() - t0)}ms`)
                return results
            })
        )
    ).flat()

    // Sum scores for each chunk.
    const combinedResults = new Map<DocID, Map<ChunkIndex, CorpusSearchResult>>()
    for (const result of allResults) {
        let docResults = combinedResults.get(result.doc)
        if (!docResults) {
            docResults = new Map<ChunkIndex, CorpusSearchResult>()
            combinedResults.set(result.doc, docResults)
        }

        const chunkResult = docResults.get(result.chunk) ?? {
            doc: result.doc,
            chunk: result.chunk,
            score: 0,
            excerpt: result.excerpt,
        }
        docResults.set(result.chunk, { ...chunkResult, score: chunkResult.score + result.score })
    }

    const results = Array.from(combinedResults.values()).flatMap(docResults => Array.from(docResults.values()))
    const MIN_SCORE = 0.3
    return results.filter(s => s.score >= MIN_SCORE).toSorted((a, b) => b.score - a.score)
}

const SEARCH_METHODS: Record<
    string,
    (index: CorpusIndex, query: Query, options: SearchOptions) => CorpusSearchResult[] | Promise<CorpusSearchResult[]>
> = { keywordSearch, embeddingsSearch }
