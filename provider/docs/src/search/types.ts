import { type ChunkIndex } from '../corpus/doc/chunks'
import { type DocID } from '../corpus/doc/doc'

/** A search query. */
export interface Query {
    text: string
    meta?: {
        activeFilename?: string
    }
}

/**
 * A search result from searching a {@link CorpusIndex}.
 */
export interface SearchResult {
    doc: DocID
    chunk: ChunkIndex
    score: number
    excerpt: string
}
