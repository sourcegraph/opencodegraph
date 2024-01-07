import { type DocID } from '../corpus/doc/doc'
import { type CorpusIndex, type IndexedDoc } from '../corpus/index/corpusIndex'
import { type Logger } from '../logger'
import { type Query, type SearchResult } from '../search/types'
import { search } from './search'

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
