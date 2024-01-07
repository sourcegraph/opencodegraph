import { readFile } from 'fs/promises'
import path from 'path'
import { CorpusArchive, createCorpusArchive } from '../src/corpus/archive/corpusArchive'
import { createWebCorpusArchive, WebCorpusArchiveOptions } from '../src/corpus/archive/web/webCorpusArchive'
import { Doc } from '../src/corpus/doc/doc'

type ArchiveKind = 'web' | 'file'
const ARCHIVE_KINDS: Record<
    ArchiveKind,
    { optionsHelp: string; toOptions?: (value: any) => unknown; createFn: (options: any) => Promise<CorpusArchive> }
> = {
    web: {
        optionsHelp: JSON.stringify({
            entryPage: new URL('https://docs.example.com'),
            prefix: new URL('https://docs.example.com'),
            ignore: ['.svg', '/old/'],
        } as WebCorpusArchiveOptions),
        toOptions: (value: any) =>
            ({
                ...value,
                entryPage: new URL(value.entryPage),
                prefix: new URL(value.prefix),
                logger: message => console.error('# ' + message),
            }) satisfies WebCorpusArchiveOptions,
        createFn: createWebCorpusArchive,
    },
    file: {
        optionsHelp: JSON.stringify(['/path/to/file1.txt', '/path/to/file2.md']),
        createFn: async (files: string[]) =>
            createCorpusArchive(
                await Promise.all(
                    files.map(async (file, i) => {
                        const data = await readFile(file, 'utf8')
                        return {
                            id: i + 1,
                            text: data,
                        } satisfies Doc
                    })
                )
            ),
    },
}

function usage(): void {
    console.error()
    console.error('Usage:')
    console.error()
    for (const kind of Object.keys(ARCHIVE_KINDS).toSorted() as ArchiveKind[]) {
        console.error(`    ${path.basename(process.argv[1])} ${kind} '${ARCHIVE_KINDS[kind].optionsHelp}'`)
    }
}

const args = process.argv.slice(2)
const kind = args.at(0) as ArchiveKind | undefined
const optionsText = args.at(1)
let optionsRaw: any
try {
    optionsRaw = JSON.parse(optionsText ?? '')
} catch (error) {
    console.error('Error parsing options JSON:', error)
    usage()
    process.exit(1)
}
if (!kind || !ARCHIVE_KINDS[kind]) {
    console.error(`Unrecognized archive kind: ${kind} (valid values are: ${Object.keys(ARCHIVE_KINDS).join(', ')})`)
    usage()
    process.exit(1)
}

const archiveHandler = ARCHIVE_KINDS[kind]
const options = archiveHandler.toOptions ? archiveHandler.toOptions(optionsRaw) : optionsRaw
const t0 = performance.now()
const archive = await archiveHandler.createFn(options)
const data = JSON.stringify(archive)
console.error(
    `# Archive complete [${Math.round(performance.now() - t0)}ms]: ${archive.docs.length} docs (${(
        data.length /
        1024 /
        1024
    ).toFixed(1)} MB), content ID: ${archive.contentID}, description ${JSON.stringify(archive.description)}`
)
process.stdout.write(data)
