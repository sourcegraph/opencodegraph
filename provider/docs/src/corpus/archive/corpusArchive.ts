import { contentID } from '../cache/contentID'
import { type Doc } from '../doc/doc'

export interface CorpusArchive {
    /**
     * A human-readable description of the corpus, often including the command used to create the
     * corpus archive.
     */
    description: string

    /** The contents of all documents in the corpus. */
    docs: Doc[]

    /** The SHA-256 hash of the content of the documents. */
    contentID: string
}

export async function createCorpusArchive(docs: Doc[], description = ''): Promise<CorpusArchive> {
    const seenIDs = new Set<number>()
    for (const doc of docs) {
        if (doc.text.length === 0) {
            throw new Error(`empty doc: ${doc.id}${doc.url ? ` (${doc.url})` : ''}`)
        }

        if (seenIDs.has(doc.id)) {
            throw new Error(`duplicate doc ID: ${doc.id}`)
        }
        seenIDs.add(doc.id)
    }

    const fullContent = docs.map(doc => doc.text).join('\0')
    return { description, docs, contentID: await contentID(fullContent) }
}
