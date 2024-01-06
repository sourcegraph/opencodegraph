export interface CrawlQueue {
    nextURL: () => URL | undefined
    enqueueURL: (url: URL) => void
    shouldCrawlURL: (url: URL) => boolean
}

export function createCrawlQueue(isURLInScope: (url: URL) => boolean): CrawlQueue {
    const seen = new Set<string>()
    const queue: URL[] = []

    /** Normalize the URL to ignore the query string and hash. */
    function normalizeURLForSeen(url: URL): string {
        return url.origin + url.pathname
    }

    function seenURL(url: URL): boolean {
        return seen.has(normalizeURLForSeen(url))
    }
    function addToSeen(url: URL): void {
        seen.add(normalizeURLForSeen(url))
    }

    const crawlQueue: CrawlQueue = {
        nextURL() {
            let url: URL | undefined
            while ((url = queue.shift())) {
                if (!seenURL(url)) {
                    addToSeen(url)
                    return url
                }
            }
            return undefined
        },
        enqueueURL(url) {
            if (crawlQueue.shouldCrawlURL(url)) {
                queue.push(url)
            }
        },
        shouldCrawlURL(url) {
            return !seenURL(url) && isURLInScope(url)
        },
    }

    return crawlQueue
}
