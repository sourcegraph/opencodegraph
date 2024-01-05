import { readFile } from 'fs/promises'
import path from 'path'
import envPaths from 'env-paths'
import { indexCorpus } from '../src/corpus'
import { createFileSystemCacheStore } from '../src/corpus/cache/store/fs'
import { type CorpusData } from '../src/corpus/data'
import { extractContentUsingMozillaReadability } from '../src/corpus/doc/contentExtractor'

const args = process.argv.slice(2)

const corpusDataFile = args[0]
const query = args[1]

const USAGE = `\nUsage: ${path.basename(process.argv[1])} <corpus-data-file> <query>`
if (!corpusDataFile) {
    console.error('Error: no corpus data file specified (use create-file-corpus or create-web-corpus to create one)')
    console.error(USAGE)
    process.exit(1)
}
if (!query) {
    console.error('Error: no query specified')
    console.error(USAGE)
    process.exit(1)
}
if (args.length !== 2) {
    console.error('Error: invalid arguments')
    console.error(USAGE)
    process.exit(1)
}

const corpusData = JSON.parse(await readFile(corpusDataFile, 'utf8')) as CorpusData

const cacheDir = envPaths('opencodegraph-provider-docs').cache
const fsCache = createFileSystemCacheStore(cacheDir)

const corpus = await indexCorpus(corpusData, {
    cache: fsCache,
    contentExtractor: extractContentUsingMozillaReadability,
})
const results = await corpus.search(query)
console.error(`# ${corpus.docs.length} docs in corpus`)
console.error(`# Query: ${JSON.stringify(query)}`)
const MAX_RESULTS = 5
console.error(`# ${results.length} results${results.length > MAX_RESULTS ? ` (showing top ${MAX_RESULTS})` : ''}`)
for (const [i, result] of results.slice(0, MAX_RESULTS).entries()) {
    const doc = corpusData.docs[result.doc - 1]
    if (i !== 0) {
        console.log()
    }
    console.log(`#${i + 1} [${result.score.toFixed(3)}] ${doc.url ?? `doc${doc.id}`}#chunk${result.chunk}`)
    console.log(`${indent(truncate(result.excerpt.replaceAll('\n\n', '\n'), 500), '\t')}`)
}

function truncate(text: string, maxLength: number): string {
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...'
    }
    return text
}

function indent(text: string, indent: string): string {
    if (text === '') {
        return ''
    }
    return indent + text.replaceAll('\n', '\n' + indent)
}
