import { type AnnotationsParams, type Selector } from '@openctx/protocol'
//
// Import from a subpackage because the main module calls `os.platform()`, which doesn't work on
// non-Node engines.
import match from 'picomatch/lib/picomatch'

/**
 * Creates a function that matches the request parameters against the selector. See {@link Selector}
 * docs for the selector specification.
 */
export function matchSelectors(selectors: Selector[] | undefined): (params: AnnotationsParams) => boolean {
    if (selectors === undefined) {
        return ALWAYS_TRUE
    }
    const matchFuncs = selectors.map(matchSelector)
    return params => {
        const filePath = trimLeadingSlash(new URL(params.file).pathname)
        return matchFuncs.some(matchFunc => matchFunc(filePath, params.content))
    }
}

const ALWAYS_TRUE = (): boolean => true

function matchSelector(selector: Selector): (filePath: string, content: string) => boolean {
    const matchPath =
        selector.path !== undefined && selector.path !== null ? match(trimLeadingSlash(selector.path)) : null
    return (filePath, content) => {
        const okPath = matchPath === null || matchPath(filePath)
        const okContentContains =
            selector.contentContains === undefined ||
            selector.contentContains === null ||
            content.includes(selector.contentContains)
        return okPath && okContentContains
    }
}

function trimLeadingSlash(text: string): string {
    return text.replace(/^\//, '')
}
