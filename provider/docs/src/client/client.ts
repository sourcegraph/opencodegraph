import { type DocID } from '../corpus/doc/doc.ts'
import { type CorpusIndex, type IndexedDoc } from '../corpus/index/corpusIndex.ts'
import { type Logger } from '../logger.ts'
import { type Query, type SearchResult } from '../search/types.ts'
import { search } from './search.ts'

/**
 * A client for searching a {@link CorpusIndex}.
 */
export interface Client {
    /** Search the corpus. */
    search(query: Query): Promise<SearchResult[]>

    /** Get a document by docID. An exception is thrown if no such document exists. */
    doc(id: DocID): IndexedDoc
}

export interface ClientOptions {
    /**
     * Called to print log messages.
     */
    logger?: Logger
}

/**
 * Create a client for searching a {@link CorpusIndex}.
 */
export function createClient(index: CorpusIndex, options: ClientOptions = {}): Client {
    return {
        doc(id) {
            const doc = index.docs.find(d => d.doc.id === id)
            if (!doc) {
                throw new Error(`no document with id ${id} in corpus`)
            }
            return doc
        },
        search(query) {
            return search(index, query, { logger: options.logger })
        },
    }
}
