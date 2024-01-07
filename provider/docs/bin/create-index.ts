import path from 'path'
import { CorpusArchive } from '../src/corpus/archive/corpusArchive'
import { extractContentUsingMozillaReadability } from '../src/corpus/doc/contentExtractor'
import { createCorpusIndex } from '../src/corpus/index/corpusIndex'

function usage(): void {
    console.error()
    console.error(`Usage: ${path.basename(process.argv[1])} < /path/to/archive.json`)
    console.error()
    console.error('Note: Use the `create-archive` script to create the archive.json file.')
    process.exit(1)
}

const args = process.argv.slice(2)
if (args.length !== 0) {
    console.error('Error: invalid arguments')
    usage()
}

const archive: CorpusArchive = await readJSONFromStdin()
console.error(
    `# Using archive: ${archive.docs.length} docs, content ID ${archive.contentID}, description ${JSON.stringify(
        archive.description
    )}`
)

const t0 = performance.now()
const index = await createCorpusIndex(archive, { contentExtractor: extractContentUsingMozillaReadability })
const data = JSON.stringify(index)
console.error(
    `# Index complete [${Math.round(performance.now() - t0)}ms]: ${index.docs.length} docs (${
        data.length / 1024 / 1024
    } MB)`
)
process.stdout.write(data)

function readJSONFromStdin(): Promise<any> {
    return new Promise((resolve, reject) => {
        const data: string[] = []
        process.stdin.on('data', chunk => {
            data.push(chunk.toString('utf8'))
        })
        process.stdin.once('end', () => {
            try {
                const json = JSON.parse(data.join(''))
                resolve(json)
            } catch (error) {
                reject(error)
            }
        })
        process.stdin.once('error', error => {
            reject(error)
        })
    })
}
