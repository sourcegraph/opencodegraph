export type ParseDOM = (html: string, url: string | undefined) => Promise<Document>

/**
 * Parse DOM (works in both Node and browser).
 */
export const parseDOM: ParseDOM =
    typeof DOMParser === 'undefined'
        ? async (html, url) => {
              const { JSDOM } = await import('jsdom')
              return new JSDOM(html, { url }).window.document
          }
        : (html, url) => {
              const document = new DOMParser().parseFromString(html, 'text/html')

              // Set base URL.
              if (url && document.head.querySelectorAll('base').length === 0) {
                  const baseEl = document.createElement('base')
                  baseEl.setAttribute('href', url)
                  document.head.append(baseEl)
              }

              return Promise.resolve(document)
          }
