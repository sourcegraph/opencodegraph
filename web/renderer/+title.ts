import { type PageContext } from 'vike/types'

export interface PageContextForTitle {
    pageTitle?: string
}

export function title(pageContext: PageContext): string {
    const title = getTitle(pageContext)
    return `${title ? `${title} | ` : ''}OpenCtx`
}

/**
 * Get the page's title if defined, either from the additional data fetched by
 * the page's onBeforeRender() hook or from the config.
 */
function getTitle(pageContext: PageContext): null | string {
    if (pageContext.pageTitle !== undefined) {
        return pageContext.pageTitle
    }

    const titleConfig = pageContext.configEntries.pageTitle?.[0]
    if (!titleConfig) {
        return null
    }
    const pageTitle = titleConfig.configValue
    if (typeof pageTitle === 'string') {
        return pageTitle
    }
    if (!pageTitle) {
        return null
    }
    const { configDefinedAt } = titleConfig
    if (isCallable(pageTitle)) {
        const val = pageTitle(pageContext)
        if (typeof val !== 'string') {
            throw new TypeError(configDefinedAt + ' should return a string')
        }
        return val
    }
    throw new Error(configDefinedAt + ' should be a string or a function returning a string')
}

function isCallable<T extends (...args: unknown[]) => unknown>(thing: unknown): thing is T {
    return thing instanceof Function || typeof thing === 'function'
}
