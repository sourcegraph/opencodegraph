import { contentID } from './cache/contentID'
import { type Doc } from './doc/doc'

export async function corpusData(docs: Doc[]): Promise<CorpusData> {
    const seenIDs = new Set<number>()
    for (const doc of docs) {
        if (seenIDs.has(doc.id)) {
            throw new Error(`duplicate doc ID: ${doc.id}`)
        }
        seenIDs.add(doc.id)
    }

    const fullContent = docs.map(doc => doc.text).join('\0')
    return { contentID: await contentID(fullContent), docs }
}

export interface CorpusData {
    /** The SHA-256 hash of the content of the docs. */
    contentID: string

    docs: Doc[]
}
