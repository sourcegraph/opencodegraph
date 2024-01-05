/* eslint-disable import/no-default-export */
import {
    createFilePositionCalculator,
    type AnnotationsParams,
    type AnnotationsResult,
    type CapabilitiesResult,
} from '@opencodegraph/provider'
import { indexCorpus } from '../corpus'
import { createIndexedDBCacheStore } from '../corpus/cache/store/indexedDB'
import { createWebStorageCacheStore } from '../corpus/cache/store/localStorage'
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
            : createWebStorageCacheStore(localStorage, 'ocg-provider-docs')
        : createIndexedDBCacheStore('ocg-provider-docs')

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
        cacheStore: CORPUS_CACHE,
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
                    const searchResults = await index.search({
                        text: contentChunk.text,
                        meta: { activeFilename: params.file },
                    })
                    for (const [i, sr] of searchResults.entries()) {
                        const MAX_RESULTS = 4
                        if (i >= MAX_RESULTS) {
                            break
                        }

                        const doc = index.doc(sr.doc)
                        result.push({
                            title: doc.content?.title || doc.doc.url || 'Untitled',
                            url: doc.doc.url,
                            ui: { detail: truncate(doc.content?.textContent || sr.excerpt, 200) },
                            range: {
                                start: positionCalculator(contentChunk.range.start),
                                end: positionCalculator(contentChunk.range.end),
                            },
                        })
                    }
                })
            )

            if (result.length >= 2) {
                // Trim common suffix (which is often the name of the doc site, like " - My Doc
                // Site").
                const suffix = longestCommonSuffix(result.map(r => r.title))
                if (suffix) {
                    for (const r of result) {
                        r.title = r.title.slice(0, -1 * suffix.length)
                    }
                }
            }

            // Truncate titles. Do this after trimming common suffixes, or else no common suffix
            // will be found if any titles were truncated.
            for (const r of result) {
                r.title = truncate(r.title, 50)
            }

            return result
        },
    }
})

function longestCommonSuffix(texts: string[]): string {
    if (texts.length === 0) {
        return ''
    }
    if (texts.length === 1) {
        return texts[0]
    }

    const minLen = Math.min(...texts.map(text => text.length))
    let suffix = ''

    for (let i = 0; i < minLen; i++) {
        // Get the current character from the end of the first string.
        const currentChar = texts[0][texts[0].length - 1 - i]

        // Check if this character is present at the same position from the end in all strings.
        if (texts.every(text => text[text.length - 1 - i] === currentChar)) {
            // If so, prepend it to the result.
            suffix = currentChar + suffix
        } else {
            break
        }
    }

    return suffix
}

function truncate(text: string, maxLength: number): string {
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...'
    }
    return text
}
