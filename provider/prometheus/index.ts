import {
    matchGlob,
    type AnnotationsParams,
    type AnnotationsResult,
    type CapabilitiesParams,
    type CapabilitiesResult,
    type Position,
    type Provider,
    type Range,
} from '@openctx/provider'

/** Settings for the Prometheus OpenCtx provider. */
export interface Settings {
    /**
     * Patterns that match metric registrations.
     */
    metricRegistrationPatterns?: MetricRegistrationPattern[]
}

interface MetricRegistrationPattern {
    /**
     * Glob pattern matching the file URIs in which to search for this pattern.
     */
    path: string

    /**
     * Regexp pattern whose first capture group matches the metric name.
     *
     * @example `prometheus\\.HistogramOpts{\\s*Name:\\s*"([^"]+)`
     * @example `new promClient\\.Histogram\\({\\s*name: '([^']+)`
     */
    pattern: string

    /**
     * The URL to view matching metrics on Prometheus, Grafana, or another metrics viewer, with $1
     * replaced by the metric name.
     *
     * @example https://prometheus.demo.do.prometheus.io/graph?g0.expr=$1&g0.tab=0
     * @example
     * https://grafana.example.com/explore?left=%5B%22now-6h%22,%22now%22,%22Prometheus%22,%7B%22expr%22:%22$1%22%7D%5D
     */
    urlTemplate: string
}

/**
 * An [OpenCtx](https://openctx.org) provider that lets you hover over a Prometheus
 * metric in your code to see what it's doing in prod and to click through to the live metrics on
 * [Prometheus](https://prometheus.io), [Grafana](https://grafana.com/), or another metrics viewer.
 *
 * These links will be visible in every dev's editor, in code search, on the code host, and in code
 * review (assuming all of those tools have OpenCtx support).
 *
 * - TODO(sqs): Make this find dashboards containing the metric (like
 *   https://github.com/panodata/grafana-wtf).
 * - TODO(sqs): Hit the Prometheus/Grafana APIs to fetch data (eg `curl -XPOST
 *   'https://prometheus.demo.do.prometheus.io/api/v1/query?query=go_gc_duration_seconds&timeout=200ms'`).
 */
const prometheus: Provider<Settings> = {
    capabilities(_params: CapabilitiesParams, settings: Settings): CapabilitiesResult {
        return { selector: settings.metricRegistrationPatterns?.map(({ path }) => ({ path })) || [] }
    },

    annotations(params: AnnotationsParams, settings: Settings): AnnotationsResult {
        const compiledPatterns:
            | (Pick<MetricRegistrationPattern, 'urlTemplate'> & {
                  pattern: RegExp
                  matchPath: (path: string) => boolean
              })[]
            | undefined = settings.metricRegistrationPatterns?.map(({ pattern, path, ...other }) => ({
            ...other,
            pattern: new RegExp(pattern, 'dgs'),
            matchPath: matchGlob(path),
        }))

        const positionCalculator = createFilePositionCalculator(params.content)

        const anns: AnnotationsResult = []
        for (const { matchPath, pattern, urlTemplate } of compiledPatterns || []) {
            if (!matchPath(new URL(params.file).pathname)) {
                continue
            }

            const ranges = matchResults(pattern, params.content, positionCalculator)
            for (const { range, metricName } of ranges) {
                anns.push({
                    title: `📟 Prometheus metric: ${metricName}`,
                    url: urlTemplate.replaceAll('$1', metricName),
                    range,
                })
            }
        }
        return anns
    },
}

export default prometheus

interface MatchResult {
    range: Range
    metricName: string
}

function matchResults(pattern: RegExp, content: string, pos: PositionCalculator): MatchResult[] {
    const results: MatchResult[] = []
    for (const match of content.matchAll(pattern)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [start, end] = match.indices![1]
        results.push({
            range: {
                start: pos(start),
                end: pos(end),
            },
            metricName: match[1],
        })
        break // only add one match per line
    }
    return results
}

type PositionCalculator = (offset: number) => Position
function createFilePositionCalculator(content: string): PositionCalculator {
    const lines = content.split('\n')
    return (offset: number) => {
        let line = 0
        let character = 0
        while (line < lines.length && offset > 0) {
            const lineLength = lines[line].length + 1 // +1 for the newline
            if (lineLength > offset) {
                character = offset
                break
            }
            offset -= lineLength
            line += 1
        }
        return { line, character }
    }
}
