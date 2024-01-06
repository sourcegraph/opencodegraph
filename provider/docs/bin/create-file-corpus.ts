import { readFile } from 'fs/promises'
import path from 'path'
import { corpusData } from '../src/corpus/data'
import { type Doc } from '../src/corpus/doc/doc'

const args = process.argv.slice(2)

const corpusFiles = args

const USAGE = `\nUsage: ${path.basename(process.argv[1])} <corpus-files>`
if (corpusFiles.length === 0) {
    console.error('Error: no corpus files specified')
    console.error(USAGE)
    process.exit(1)
}

const data = await corpusData(
    await Promise.all(
        corpusFiles.map(async (file, i) => {
            const data = await readFile(file, 'utf8')
            return {
                id: i + 1,
                text: data,
            } satisfies Doc
        })
    )
)

console.error(`# ${data.docs.length} docs`)
console.log(JSON.stringify(data, null, 2))
