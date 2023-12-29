/* eslint-disable import/no-default-export */
import { type AnnotationsParams, type AnnotationsResult, type CapabilitiesResult } from '@opencodegraph/provider'
import { indexCorpus } from '../corpus'
import { createIndexedDBCorpusCache } from '../corpus/cache/indexedDb'
import { createWebStorageCorpusCache } from '../corpus/cache/localStorage'
import { corpusData } from '../corpus/data'
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
    })

    return {
        capabilities(): CapabilitiesResult {
            return {}
        },

        async annotations(params: AnnotationsParams): Promise<AnnotationsResult> {
            console.time('search')
            const searchResults = await index.search(params.content)
            console.timeEnd('search')

            const result: AnnotationsResult = []
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
                })
            }
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
