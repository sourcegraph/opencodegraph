import { type Logger } from '../logger'
import { type CorpusArchive } from './archive/corpusArchive'
import { createCache, noopCache, type Cache, type CacheStore } from './cache/cache'
import { contentID } from './cache/contentID'
import { memo } from './cache/memo'
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
    data: CorpusArchive

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
    doc: Pick<Doc, 'id' | 'url'>
    content: Pick<Content, 'title' | 'textContent'> | null

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

export function corpusIndexFromURL(url: string): Promise<CorpusIndex> {
    // TODO(sqs)
    return corpusDataSource(
        fetch(url).then(resp => {
            if (!resp.ok) {
                throw new Error(`failed to fetch corpus data from ${url}: ${resp.status} ${resp.statusText}`)
            }
            if (!resp.headers.get('Content-Type')?.includes('json')) {
                throw new Error(`corpus data from ${url} is not JSON`)
            }
            return resp.json()
        })
    )
}

/**
 * Index a corpus.
 */
export async function indexCorpus(
    corpus: CorpusArchive,
    { cacheStore, contentExtractor, logger }: IndexOptions = {}
): Promise<CorpusIndex> {
    const cache = cacheStore ? createCache(cacheStore) : noopCache

    const indexedDocs = await cachedIndexCorpusDocs(corpus, { contentExtractor }, cache)

    const tfidf = await cachedCreateTFIDFIndex(indexedDocs, cache)

    const index: CorpusIndex = {
        data: corpus,
        docs: indexedDocs,
        tfidf,
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

async function indexCorpusDocs(
    corpus: CorpusArchive,
    { contentExtractor }: Pick<IndexOptions, 'contentExtractor'>
): Promise<IndexedDoc[]> {
    return Promise.all(
        corpus.docs.map(async doc => {
            const content = contentExtractor ? await contentExtractor.extractContent(doc) : null
            const chunks = chunk(content?.content ?? doc.text, { isMarkdown: doc.text.includes('##') })
            return {
                doc: { id: doc.id, url: doc.url },
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
    corpus: CorpusArchive,
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
