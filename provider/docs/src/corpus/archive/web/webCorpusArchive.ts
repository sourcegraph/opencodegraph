import { parseDOM } from '../../../dom.ts'
import { type Logger } from '../../../logger.ts'
import { type Doc } from '../../doc/doc.ts'
import { createCorpusArchive, type CorpusArchive } from '../corpusArchive.ts'
import { createCrawlQueue } from './crawlQueue.ts'

export interface WebCorpusArchiveOptions {
    /**
     * Start crawling from this page.
     */
    entryPage: URL

    /**
     * Only include pages whose URL starts with this prefix.
     */
    prefix: URL

    /**
     * Exclude pages whose URL contains any of these strings.
     */
    ignore?: string[]

    /**
     * Called to print log messages.
     */
    logger?: Logger
}

export async function createWebCorpusArchive({
    entryPage,
    prefix,
    ignore,
    logger,
}: WebCorpusArchiveOptions): Promise<CorpusArchive> {
    async function getDocs(): Promise<Doc[]> {
        const { nextURL, enqueueURL, shouldCrawlURL } = createCrawlQueue(
            url => urlHasPrefix(url, prefix) && !ignore?.some(ignore => url.href.includes(ignore))
        )

        if (!shouldCrawlURL(entryPage)) {
            throw new Error(`web corpus entryPage (${entryPage}) does not start with prefix (${prefix})`)
        }

        enqueueURL(entryPage)

        const documents: Doc[] = []

        let url: URL | undefined
        while ((url = nextURL())) {
            logger?.(`Crawling URL: ${url.href}`)

            const resp = await fetch(url.href)
            logger?.(`- Response: ${resp.status} ${resp.statusText}`)
            if (!resp.ok) {
                continue
            }

            // Handle redirects.
            if (resp.redirected || resp.url !== url.href) {
                logger?.(`- Got redirect (redirected=${resp.redirected}, resp.url=${resp.url})`)
                const wasRedirectedFromEntryPage = entryPage.href === url.href
                url = new URL(resp.url)
                if (!shouldCrawlURL(url) && !wasRedirectedFromEntryPage) {
                    logger?.(`- Skipping redirect destination URL: ${url}`)
                    continue
                }
                logger?.(`- Continuing with redirect destination URL: ${url}`)
            }

            const html = await resp.text()
            const dom = await parseDOM(html, resp.url)

            const canonicalURLStr = dom.querySelector<HTMLLinkElement>("head > link[rel='canonical']")?.href
            if (canonicalURLStr && canonicalURLStr !== url.href) {
                const canonicalURL = parseURL(canonicalURLStr)
                if (canonicalURL) {
                    // Only trust the canonical URL if it's same-origin, to avoid letting other
                    // sites pollute this corpus.
                    if (canonicalURL.origin === url.origin) {
                        logger?.(`- Found canonical URL: ${canonicalURL}`)
                        url = canonicalURL
                        if (!shouldCrawlURL(url)) {
                            continue
                        }
                    }
                }
            }

            documents.push({
                id: documents.length + 1,
                text: html,
                url: url.toString(),
            })

            const pageLinks = dom.querySelectorAll<HTMLAnchorElement>('a[href]')
            logger?.(`- Found ${pageLinks.length} links on page`)
            for (const link of pageLinks) {
                const linkURL = parseURL(link.href)
                if (linkURL) {
                    enqueueURL(linkURL)
                }
            }
        }

        return documents
    }

    const docs = await getDocs()
    return createCorpusArchive(
        docs,
        `createWebCorpusArchive with options ${JSON.stringify({ entryPage, prefix, ignore })}`
    )
}

function parseURL(urlStr: string): URL | undefined {
    try {
        return new URL(urlStr)
    } catch {
        return undefined
    }
}

export function urlHasPrefix(url: URL, prefix: URL): boolean {
    // Disallow username and password.
    if (url.username || url.password) {
        return false
    }
    return (
        url.protocol === prefix.protocol &&
        url.host === prefix.host &&
        (url.pathname === prefix.pathname ||
            url.pathname.startsWith(prefix.pathname.endsWith('/') ? prefix.pathname : prefix.pathname + '/') ||
            (prefix.pathname.endsWith('/') && url.pathname === prefix.pathname.slice(0, -1)))
    )
}
