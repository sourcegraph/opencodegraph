import { type Logger } from '../logger'
import { createCache, noopCache, type Cache, type CacheStore } from './cache/cache'
import { contentID } from './cache/contentID'
import { memo } from './cache/memo'
import { type CorpusData } from './data'
import { chunk, type Chunk, type ChunkIndex } from './doc/chunks'
import { type Content, type ContentExtractor } from './doc/contentExtractor'
import { type Doc, type DocID } from './doc/doc'
import { multiSearch } from './search/multi'

/**
 * An index of a corpus.
 */
export interface CorpusIndex {
    data: CorpusData

    docs: IndexedDoc[]

    doc(id: DocID): IndexedDoc
    search(query: Query): Promise<CorpusSearchResult[]>
}

/**
 * An indexed document.
 */
export interface IndexedDoc {
    doc: Doc
    content: Content | null
    chunks: Chunk[]
}

/** A search query. */
export interface Query {
    text: string
    meta?: {
        activeFilename?: string
    }
}

/**
 * A search result from searching a corpus.
 */
export interface CorpusSearchResult {
    doc: DocID
    chunk: ChunkIndex
    score: number
    excerpt: string
}

/**
 * Options for indexing a corpus.
 */
export interface IndexOptions {
    cacheStore?: CacheStore
    contentExtractor?: ContentExtractor

    /**
     * Called to print log messages.
     */
    logger?: Logger
}

/**
 * Index a corpus.
 */
export async function indexCorpus(
    data: CorpusData,
    { cacheStore, contentExtractor, logger }: IndexOptions = {}
): Promise<CorpusIndex> {
    const indexedDocs: IndexedDoc[] = []

    const cache = cacheStore ? createCache(cacheStore) : noopCache

    for (const doc of data.docs) {
        const content = await cachedExtractContent(cache, contentExtractor, doc)

        const chunks = chunk(content?.content ?? doc.text, { isMarkdown: doc.text.includes('##') })

        indexedDocs.push({ doc, content, chunks })
    }

    const index: CorpusIndex = {
        data,
        docs: indexedDocs,
        doc(id) {
            const doc = indexedDocs.find(d => d.doc.id === id)
            if (!doc) {
                throw new Error(`no document with id ${id} in corpus`)
            }
            return doc
        },
        search(query) {
            return multiSearch(index, query, { cache, logger })
        },
    }
    return index
}

async function cachedExtractContent(
    cache: Cache,
    extractor: ContentExtractor | undefined,
    doc: Doc
): Promise<Content | null> {
    if (!extractor) {
        return Promise.resolve(null)
    }
    const key = `extractContent:${extractor.id}:${await contentID(`${doc.url}:${doc.text}`)}`
    return memo(cache, key, () => extractor.extractContent(doc))
}
