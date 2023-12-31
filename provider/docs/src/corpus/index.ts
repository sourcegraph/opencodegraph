import { type Logger } from '../logger'
import { memo, noopCache, type CorpusCache } from './cache/cache'
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
    search(query: string): Promise<CorpusSearchResult[]>
}

/**
 * An indexed document.
 */
export interface IndexedDoc {
    doc: Doc
    content: Content | null
    chunks: Chunk[]
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
    cache?: CorpusCache
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
    { cache = noopCache, contentExtractor, logger }: IndexOptions = { cache: noopCache }
): Promise<CorpusIndex> {
    const indexedDocs: IndexedDoc[] = []

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

function cachedExtractContent(
    cache: CorpusCache,
    extractor: ContentExtractor | undefined,
    doc: Doc
): Promise<Content | null> {
    if (!extractor) {
        return Promise.resolve(null)
    }
    return memo(cache, `${doc.url}:${doc.text}`, `extractContent:${extractor.id}`, () => extractor.extractContent(doc))
}
