/* eslint-disable import/no-default-export */
import {
    createFilePositionCalculator,
    type AnnotationsParams,
    type AnnotationsResult,
    type CapabilitiesResult,
} from '@opencodegraph/provider'
import { indexCorpus } from '../corpus'
import { createIndexedDBCorpusCache } from '../corpus/cache/store/indexedDB'
import { createWebStorageCorpusCache } from '../corpus/cache/store/localStorage'
import { corpusData } from '../corpus/data'
import { chunk } from '../corpus/doc/chunks'
import { extractContentUsingMozillaReadability } from '../corpus/doc/contentExtractor'
import { corpusDataURLSource } from '../corpus/source/source'
import { createWebCorpusSource } from '../corpus/source/web/webCorpusSource'
import { multiplex } from './multiplex'

/** Settings for the docs OpenCodeGraph provider. */
export interface Settings {
    corpus:
        | { url: string }
        | {
              entryPage: string
              prefix: string
              ignore?: string[]
          }
}

const CORPUS_CACHE =
    typeof indexedDB === 'undefined'
        ? typeof localStorage === 'undefined'
            ? undefined
            : createWebStorageCorpusCache(localStorage, 'ocg-provider-docs')
        : createIndexedDBCorpusCache('ocg-provider-docs')

/**
 * An [OpenCodeGraph](https://opencodegraph.org) provider that adds contextual documentation to your
 * code from an existing documentation corpus.
 */
export default multiplex<Settings>(async settings => {
    const source =
        'url' in settings.corpus
            ? corpusDataURLSource(settings.corpus.url)
            : createWebCorpusSource({
                  entryPage: new URL(settings.corpus.entryPage),
                  prefix: new URL(settings.corpus.prefix),
                  ignore: settings.corpus.ignore,
                  logger: message => console.log(message),
              })
    const index = await indexCorpus(corpusData(await source.docs()), {
        cache: CORPUS_CACHE,
        contentExtractor: extractContentUsingMozillaReadability,
        logger: console.debug,
    })

    return {
        capabilities(): CapabilitiesResult {
            return {}
        },

        async annotations(params: AnnotationsParams): Promise<AnnotationsResult> {
            const result: AnnotationsResult = []
            const positionCalculator = createFilePositionCalculator(params.content)
            const contentChunks = chunk(params.content, { isMarkdown: params.file.endsWith('.md'), isTargetDoc: true })
            await Promise.all(
                contentChunks.map(async contentChunk => {
                    const searchResults = await index.search(contentChunk.text)
                    for (const [i, sr] of searchResults.entries()) {
                        const MAX_RESULTS = 4
                        if (i >= MAX_RESULTS) {
                            break
                        }

                        const doc = index.doc(sr.doc)
                        result.push({
                            title: truncate(doc.content?.title || doc.doc.url || 'Untitled', 50),
                            url: doc.doc.url,
                            ui: { detail: truncate(doc.content?.textContent || sr.excerpt, 100) },
                            range: {
                                start: positionCalculator(contentChunk.range.start),
                                end: positionCalculator(contentChunk.range.end),
                            },
                        })
                    }
                })
            )
            return result
        },
    }
})

function truncate(text: string, maxLength: number): string {
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...'
    }
    return text
}
