import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { createClient } from './client/client'
import { createCorpusArchive } from './corpus/archive/corpusArchive'
import { indexCorpus } from './corpus/index/corpusIndex'
import { type SearchResult } from './search/types'

describe('e2e', () => {
    test('urlParsing', async () => {
        const docFile = await fs.readFile(path.join(__dirname, 'testdata/corpus/urlParsing.md'), 'utf8')
        const codeFile = await fs.readFile(path.join(__dirname, 'testdata/code/urlParsing.ts'), 'utf8')

        const index = await indexCorpus(await createCorpusArchive([{ id: 1, text: docFile }]))
        const client = createClient(index)
        const results = await client.search({ text: codeFile })
        roundScores(results)
        expect(results.slice(0, 1)).toEqual<SearchResult[]>([
            {
                doc: 1,
                chunk: 3,
                excerpt: 'Audio URL parsing\n\nTo parse an audio URL, use the `parseAudioURL` function.',
                score: 0.764,
            },
        ])
    })
})

function roundScores(results: SearchResult[]) {
    for (const result of results) {
        result.score = Math.round(result.score * 1000) / 1000
    }
}
