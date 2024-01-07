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

    /** The final score after combining the individual scores from different search methods. */
    score: number

    /** Scores from all search methods that returned this result. */
    scores: { [searchMethod: string]: number }

    excerpt: string
}
