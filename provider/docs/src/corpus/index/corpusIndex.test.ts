import { describe, expect, test } from 'vitest'
import { createCorpusArchive } from '../archive/corpusArchive'
import { type Doc, type DocID } from '../doc/doc'
import { createCorpusIndex, fromJSON } from './corpusIndex'

export function doc(id: DocID, text: string): Doc {
    return { id, text }
}

describe('indexCorpus', async () => {
    const INDEX = await createCorpusIndex(await createCorpusArchive([doc(1, 'a'), doc(2, 'b')]))

    test('docs', () => {
        expect(INDEX.docs.length).toBe(2)
    })

    test('JSON-serializable', async () => {
        const serialized = fromJSON(JSON.parse(JSON.stringify(INDEX)))
        const indexWithoutToJSON = { ...INDEX }
        delete (indexWithoutToJSON as any).toJSON
        expect(serialized.docs[0].chunks[0].embeddings).toBeInstanceOf(Float32Array)
        expect(serialized.docs).toEqual(INDEX.docs)
    })
})
