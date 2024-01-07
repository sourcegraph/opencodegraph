import { DocID } from '../corpus/doc/doc'
import { IndexedDoc, type CorpusIndex } from '../corpus/index/corpusIndex'
import { Logger } from '../logger'
import { Query, SearchResult } from '../search/types'
import { search } from './search'

export interface Client {
    doc(id: DocID): IndexedDoc
    search(query: Query): Promise<SearchResult[]>
}

export interface ClientOptions {
    /**
     * Called to print log messages.
     */
    logger?: Logger
}

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
