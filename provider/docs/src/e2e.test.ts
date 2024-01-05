import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { indexCorpus, type CorpusSearchResult } from './corpus'
import { corpusData } from './corpus/data'

describe('e2e', () => {
    test('urlParsing', async () => {
        const docFile = await fs.readFile(path.join(__dirname, 'testdata/corpus/urlParsing.md'), 'utf8')
        const codeFile = await fs.readFile(path.join(__dirname, 'testdata/code/urlParsing.ts'), 'utf8')

        const corpus = await indexCorpus(corpusData([{ id: 1, text: docFile }]))
        const results = await corpus.search({ text: codeFile })
        roundScores(results)
        expect(results).toEqual<CorpusSearchResult[]>([
            {
                doc: 1,
                chunk: 3,
                excerpt: 'Audio URL parsing\n\nTo parse an audio URL, use the `parseAudioURL` function.',
                score: 0.755,
            },
        ])
    })
})

function roundScores(results: CorpusSearchResult[]) {
    for (const result of results) {
        result.score = Math.round(result.score * 1000) / 1000
    }
}
