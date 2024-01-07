import { describe, expect, test } from 'vitest'
import { createCorpusArchive } from '../archive/corpusArchive'
import { type Doc, type DocID } from '../doc/doc'
import { createCorpusIndex } from './corpusIndex'

export function doc(id: DocID, text: string): Doc {
    return { id, text }
}

describe('indexCorpus', () => {
    test('#docs', async () => {
        expect((await createCorpusIndex(await createCorpusArchive([doc(1, 'a'), doc(2, 'b')]))).docs.length).toBe(2)
    })
})
