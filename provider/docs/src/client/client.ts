import { type ChunkIndex } from '../corpus/doc/chunks'
import { type DocID } from '../corpus/doc/doc'
import { type CorpusIndex } from '../corpus/index/corpusIndex'

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
