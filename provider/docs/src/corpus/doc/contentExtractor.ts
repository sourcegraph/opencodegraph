import { Readability } from '@mozilla/readability'
import { parseDOM } from '../../dom'
import { type Doc } from './doc'

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
    id: string
    extractContent(doc: Doc): Promise<Content | null>
}

export const extractContentUsingMozillaReadability: ContentExtractor = {
    id: 'mozillaReadability',
    async extractContent(doc) {
        const info = new Readability(await parseDOM(doc.text, doc.url), {
            charThreshold: 500,
        }).parse()
        return info
            ? {
                  title: info.title,
                  content: info.content,
                  textContent: info.textContent,
              }
            : null
    },
}
