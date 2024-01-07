import { type CorpusSearchResult, type IndexOptions, type Query } from '..'
import { type CorpusArchive } from '../archive/corpusArchive'
import { createCache, noopCache, type Cache } from '../cache/cache'
import { contentID } from '../cache/contentID'
import { memo } from '../cache/memo'
import { chunk, type Chunk } from '../doc/chunks'
import { type Content } from '../doc/contentExtractor'
import { type Doc, type DocID } from '../doc/doc'
import { embedText } from '../search/embeddings'
import { multiSearch } from '../search/multi'
import { createTFIDFIndex, type TFIDFIndex } from '../search/tfidf'

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
