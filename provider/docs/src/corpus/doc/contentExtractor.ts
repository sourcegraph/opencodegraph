import { Readability } from '@mozilla/readability'
import { parseDOM } from '../../dom.ts'
import { type Doc } from './doc.ts'

export interface Content {
    /**
     * Title of the document.
     */
    title: string

    /**
     * Content of the document, including some markup. Omits non-content-related elements (header,
     * footer, navigation, etc.).
     */
    content: string

    /**
     * Text content of the document, with all markup removed. Omits all non-content-related
     * elements.
     */
    textContent: string
}

export interface ContentExtractor {
    /**
     * The ID of the content extractor is used as a cache key for its output. Change the ID to
     * invalidate previously cached data when the chunker implementation changes significantly.
     */
    id: string

    extractContent(doc: Doc): Promise<Content | null>
}

export const extractContentUsingMozillaReadability: ContentExtractor = {
    id: 'mozillaReadability',
    async extractContent(doc) {
        const dom = await parseDOM(doc.text, doc.url)
        const info = new Readability(dom, {
            charThreshold: 500,
        }).parse()
        return info
            ? {
                  title: dom.title,
                  content: info.content,
                  textContent: info.textContent,
              }
            : null
    },
}
