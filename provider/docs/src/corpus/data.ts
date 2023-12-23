import { type Doc } from './doc/doc'

export function corpusData(docs: Doc[]): CorpusData {
    const seenIDs = new Set<number>()
    for (const doc of docs) {
        if (seenIDs.has(doc.id)) {
            throw new Error(`duplicate doc ID: ${doc.id}`)
        }
        seenIDs.add(doc.id)
    }

    return { docs }
}

export interface CorpusData {
    docs: Doc[]
}
