import { describe, expect, test } from 'vitest'
import { indexCorpus } from '.'
import { corpusData } from './data'
import { type Doc, type DocID } from './doc/doc'

export function doc(id: DocID, text: string): Doc {
    return { id, text }
}

describe('indexCorpus', () => {
    test('#docs', async () => {
        expect((await indexCorpus(await corpusData([doc(1, 'a'), doc(2, 'b')]))).docs.length).toBe(2)
    })
})
