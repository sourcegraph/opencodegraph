import path from 'path'
import { corpusData } from '../src/corpus/data'
import { createWebCorpusSource } from '../src/corpus/source/web/webCorpusSource'

const args = process.argv.slice(2)

const entryPage = args[0]
const prefix = args[1]
const ignore = args.slice(2)

const USAGE = `\nUsage: ${path.basename(process.argv[1])} <entry-page-url> <prefix-url> [ignore]`
if (!entryPage || !prefix || args.length < 2) {
    console.error('Error: invalid arguments')
    console.error(USAGE)
    process.exit(1)
}

const corpusSource = createWebCorpusSource({
    entryPage: new URL(entryPage),
    prefix: new URL(prefix),
    ignore,
    logger: message => console.error('# ' + message),
})

const data = corpusData(await corpusSource.docs())

console.error(`# ${data.docs.length} docs`)
console.log(JSON.stringify(data, null, 2))
