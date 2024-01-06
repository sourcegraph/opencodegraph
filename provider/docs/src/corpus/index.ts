import { type Logger } from '../logger'
import { createCache, noopCache, type Cache, type CacheStore } from './cache/cache'
import { contentID } from './cache/contentID'
import { memo } from './cache/memo'
import { type CorpusData } from './data'
import { chunk, type Chunk, type ChunkIndex } from './doc/chunks'
import { type Content, type ContentExtractor } from './doc/contentExtractor'
import { type Doc, type DocID } from './doc/doc'
import { embedText } from './search/embeddings'
import { multiSearch } from './search/multi'
import { createTFIDFIndex, type TFIDFIndex } from './search/tfidf'

/**
 * An index of a corpus.
 */
export interface CorpusIndex {
    data: CorpusData

    // Index data
    docs: IndexedDoc[]
    tfidf: TFIDFIndex

    doc(id: DocID): IndexedDoc
    search(query: Query): Promise<CorpusSearchResult[]>
}

/**
 * An indexed document.
 */
export interface IndexedDoc {
    docID: Doc['id']

    content: Pick<Content, 'title' | 'textContent'> | null
    url: Doc['url']

    /** The SHA-256 hash of the indexed content (including chunks). */
    contentID: string

    chunks: (Chunk & { embeddings: Float32Array })[]
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
    corpus: CorpusData,
    { cacheStore, contentExtractor, logger }: IndexOptions = {}
): Promise<CorpusIndex> {
    const cache = cacheStore ? createCache(cacheStore) : noopCache

    // TODO(sqs): index takes ~235ms
    console.time('index-docs')
    const indexedDocs = await cachedIndexCorpusDocs(corpus, { contentExtractor }, cache)
    console.timeEnd('index-docs')

    console.time('index-tfidf')
    const tfidf = await cachedCreateTFIDFIndex(indexedDocs, cache)
    console.timeEnd('index-tfidf')

    const index: CorpusIndex = {
        data: corpus,
        docs: indexedDocs,
        tfidf,
        doc(id) {
            const doc = indexedDocs.find(d => d.docID === id)
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

async function indexCorpusDocs(
    corpus: CorpusData,
    { contentExtractor }: Pick<IndexOptions, 'contentExtractor'>
): Promise<IndexedDoc[]> {
    return Promise.all(
        corpus.docs.map(async doc => {
            const content = contentExtractor ? await contentExtractor.extractContent(doc) : null
            const chunks = chunk(content?.content ?? doc.text, { isMarkdown: doc.text.includes('##') })
            return {
                docID: doc.id,
                url: doc.url,
                content:
                    content?.title && content?.textContent
                        ? { title: content.title, textContent: content.textContent }
                        : null,
                contentID: await contentID(JSON.stringify([doc, content, chunks])),
                chunks: await Promise.all(
                    chunks.map(async chunk => ({
                        ...chunk,
                        embeddings: await embedText(chunk.text),
                    }))
                ),
            } satisfies IndexedDoc
        })
    )
}

async function cachedIndexCorpusDocs(
    corpus: CorpusData,
    options: Pick<IndexOptions, 'contentExtractor'>,
    cache: Cache
): Promise<IndexedDoc[]> {
    const key = `indexCorpusDocs:${corpus.contentID}:${options.contentExtractor?.id ?? 'noContentExtractor'}`
    return memo(cache, key, () => indexCorpusDocs(corpus, options))
}

async function cachedCreateTFIDFIndex(docs: IndexedDoc[], cache: Cache): Promise<TFIDFIndex> {
    return memo(cache, `tfidfIndex:${await contentID(docs.map(doc => doc.contentID).join('\0'))}`, () =>
        Promise.resolve(createTFIDFIndex(docs))
    )
}
