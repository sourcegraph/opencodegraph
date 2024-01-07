/* eslint-disable import/no-default-export */
import { readFile } from 'node:fs/promises'
import {
    createFilePositionCalculator,
    type AnnotationsParams,
    type AnnotationsResult,
    type CapabilitiesResult,
} from '@opencodegraph/provider'
import { createClient } from '../client/client.ts'
import { chunk } from '../corpus/doc/chunks.ts'
import { fromJSON, type CorpusIndex } from '../corpus/index/corpusIndex.ts'
import { multiplex } from './multiplex.ts'

/** Settings for the docs OpenCodeGraph provider. */
export interface Settings {
    index: string
}

/**
 * An [OpenCodeGraph](https://opencodegraph.org) provider that adds contextual documentation to your
 * code from an existing documentation corpus.
 */
export default multiplex<Settings>(async settings => {
    const index = await fetchIndex(settings.index)
    const client = createClient(index, { logger: console.debug })

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
                    const searchResults = await client.search({
                        text: contentChunk.text,
                        meta: { activeFilename: params.file },
                    })
                    for (const [i, sr] of searchResults.entries()) {
                        const MAX_RESULTS = 5
                        if (i >= MAX_RESULTS) {
                            break
                        }

                        const doc = client.doc(sr.doc)
                        result.push({
                            title: doc.content?.title || doc.doc?.url || 'Untitled',
                            url: doc.doc?.url,
                            ui: {
                                detail: truncate(doc.content?.textContent || sr.excerpt, 200),
                                format: 'plaintext',
                                group: '📘 Docs',
                                presentationHints: ['group-at-top-of-file'],
                            },
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
                        // Don't trim suffix if it would result in an empty or very short string.
                        if (r.title.length >= suffix.length + 10) {
                            r.title = r.title.slice(0, -1 * suffix.length)
                        }
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

async function fetchIndex(urlStr: string): Promise<CorpusIndex> {
    const url = new URL(urlStr)
    if (url.protocol === 'file:') {
        return fromJSON(JSON.parse(await readFile(url.pathname, 'utf-8')))
    }

    const resp = await fetch(urlStr)
    if (!resp.ok) {
        throw new Error(`Failed to fetch corpus index from ${urlStr} with HTTP status ${resp.status}`)
    }
    return fromJSON(await resp.json())
}

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
