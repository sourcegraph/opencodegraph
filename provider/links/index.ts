import {
    matchGlob,
    type ItemsParams,
    type ItemsResult,
    type CapabilitiesParams,
    type CapabilitiesResult,
    type Provider,
    type Range,
} from '@openctx/provider'

/** Settings for the `links` OpenCtx provider. */
export interface Settings {
    links?: LinkPattern[]
}

interface LinkPattern {
    /** Title of the link. */
    title: string

    /** URL of the link. */
    url: string

    /** A description of the link's destination. Markdown is supported. */
    description?: string

    /** The type of link (if applicable), which may affect the appearance. */
    type?: 'docs'

    /** Glob pattern matching the file URIs to annotate. */
    path: string

    /**
     * Regexp pattern matching the locations in a file to annotate. If undefined, it adds the link
     * to the top of the file.
     *
     * The pattern may contain capture groups. The values of matched capture groups can be used in
     * the `title`, `url`, and `description` fields by using:
     *
     * - $n for the nth capture group
     * - $<name> for the named capture group with the given name
     * - $<name|queryEscape> for the value of encodeURIComponent($<name>), for the `url` field
     *
     * For example, if a LinkPattern has a title `Hello, $1` and a pattern `(alice|bob)`, then the
     * title returned to the client would be `Hello, alice` for every occurrence of `alice` in the
     * text, and likewise `Hello, bob` for every occurrence of `bob`.
     */
    pattern?: string
}

/**
 * An [OpenCtx](https://openctx.org) provider that annotates code files with links based
 * on a configurable list of patterns.
 *
 * For example, you can use this to display the following kinds of things:
 *
 * - a link to internal security docs alongside any externally accessible API handlers;
 * - a link to CSS styling guidelines atop CSS files in your web app;
 * - a link to internal build/release docs in all build files
 * - etc.
 *
 * These links will be visible in every dev's editor, in code search, on the code host, and in code
 * review (assuming all of those tools have OpenCtx support).
 */
const links: Provider<Settings> = {
    capabilities(_params: CapabilitiesParams, settings: Settings): CapabilitiesResult {
        return { selector: settings.links?.map(({ path }) => ({ path })) || [] }
    },

    items(params: ItemsParams, settings: Settings): ItemsResult {
        const compiledPatterns:
            | (Pick<LinkPattern, 'title' | 'url' | 'description' | 'type'> & {
                  pattern?: RegExp
                  matchPath: (path: string) => boolean
              })[]
            | undefined = settings.links?.map(({ pattern, path, ...other }) => ({
            ...other,
            pattern: pattern ? new RegExp(pattern, 'dg') : undefined,
            matchPath: matchGlob(path),
        }))

        const lines = params.content.split(/\r?\n/)
        const items: ItemsResult = []
        for (const { title, url, description, type, matchPath, pattern } of compiledPatterns || []) {
            if (!matchPath(new URL(params.file).pathname)) {
                continue
            }

            const ranges = matchResults(pattern, lines)
            for (const { range, groups } of ranges) {
                items.push({
                    title: `${type === 'docs' ? '📘 Docs: ' : ''}${interpolate(title, groups)}`,
                    url: interpolate(url, groups),
                    ui: description ? { detail: interpolate(description, groups), format: 'markdown' } : undefined,
                    range,
                })
            }
        }

        return items
    },
}

export default links

interface MatchResult {
    range: Range
    groups?: MatchGroup[]
}

interface MatchGroup {
    name: string | number
    value: string
}

function matchResults(pattern: RegExp | undefined, lines: string[]): MatchResult[] {
    const results: MatchResult[] = []
    for (const [i, line] of lines.entries()) {
        if (!pattern) {
            // If no pattern, add the link to the top.
            results.push({
                range: {
                    start: { line: i, character: 0 },
                    end: { line: i, character: line.length },
                },
            })
            break
        }

        for (const match of line.matchAll(pattern)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const [start, end] = match.indices![0]
            results.push({
                range: {
                    start: { line: i, character: start },
                    end: { line: i, character: end },
                },
                groups: makeGroups(match),
            })
            break // only add one match per line
        }
    }
    return results
}

function makeGroups(match: RegExpMatchArray): MatchGroup[] {
    const namedGroups: MatchGroup[] = match.groups
        ? Object.entries(match.groups).map(([name, value]) => ({ name, value }))
        : []
    const positionalGroups: MatchGroup[] = match.map((value, i) => ({ name: i, value }))
    return [...namedGroups, ...positionalGroups]
}

function interpolate(text: string, groups?: MatchGroup[]): string {
    if (!groups) {
        return text
    }
    return text.replaceAll(/\$(\d+)|\$<([^>]+)>/g, (_, nStr: string, name: string) => {
        if (nStr) {
            const n = parseInt(nStr, 10)
            const group = groups.find(g => g.name === n)
            return group?.value ?? _
        }
        if (name) {
            const isQueryEscape = name.endsWith('|queryEscape')
            name = name.replace(/\|queryEscape$/, '')
            const group = groups.find(g => g.name === name)
            return group ? (isQueryEscape ? encodeURIComponent(group.value) : group.value) : _
        }
        return _
    })
}
