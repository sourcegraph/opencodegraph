import { readFile } from 'fs/promises'
import path from 'path'
import { createClient } from '../src/client/client.ts'
import { fromJSON } from '../src/corpus/index/corpusIndex.ts'

const args = process.argv.slice(2)

const indexFile = args[0]
const query = args[1]

const USAGE = `\nUsage: ${path.basename(process.argv[1])} <index-file> <query>`
if (!indexFile) {
    console.error('Error: no index file specified (use the `create-index` script to create one)')
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

const index = fromJSON(JSON.parse(await readFile(indexFile, 'utf8')))

const client = createClient(index, { logger: message => console.error('# ' + message) })

const results = await client.search({ text: query })
const MAX_RESULTS = 5
const SHOW_EXCERPT = false
const SHOW_SCORES = true
console.error(`# ${results.length} results${results.length > MAX_RESULTS ? ` (showing top ${MAX_RESULTS})` : ''}`)
for (const [i, result] of results.slice(0, MAX_RESULTS).entries()) {
    const doc = client.doc(result.doc)
    if (i !== 0) {
        console.log()
    }
    console.log(`#${i + 1} [${result.score.toFixed(3)}] ${doc.doc.url ?? ''} doc${doc.doc.id}#chunk${result.chunk}`)
    const chunk = doc.chunks[result.chunk]
    if (SHOW_EXCERPT) {
        console.log(`${indent(truncate(chunk.text.replaceAll('\n\n', '\n'), 500), '\t')}`)
    }
    if (SHOW_SCORES) {
        console.log(`\tscores: ${JSON.stringify(result.scores)}`)
    }
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
