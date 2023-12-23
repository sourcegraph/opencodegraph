/**
 * A unique identifier for a document in a corpus.
 */
export type DocID = number

/**
 * A raw document in a corpus.
 */
export interface Doc {
    id: DocID
    text: string

    url?: string
}
