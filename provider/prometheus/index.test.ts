import { type AnnotationsResult, type CapabilitiesResult } from '@opencodegraph/provider'
import { describe, expect, test } from 'vitest'
import prometheus, { type Settings } from './index'

describe('prometheus', () => {
    const SETTINGS: Settings = {
        metricRegistrationPatterns: [
            {
                path: '**/*.go',
                pattern: /prometheus\.HistogramOpts{\s*Name:\s*"([^"]+)"/.source,
                urlTemplate: 'https://example.com/?q=$1',
            },
        ],
    }

    test('capabilities', async () => {
        expect(await prometheus.capabilities({}, SETTINGS)).toStrictEqual<CapabilitiesResult>({
            selector: [{ path: '**/*.go' }],
        })
    })

    test('annotations', () => {
        expect(
            prometheus.annotations(
                {
                    file: 'file:///a/b.go',
                    content: `
// histogram is a Prometheus metric.
var histogram = promauto.NewHistogram(prometheus.HistogramOpts{
    Name:    "random_numbers",
    Help:    "A histogram of normally distributed random numbers.",
    Buckets: prometheus.LinearBuckets(-3, .1, 61),
})`.trim(),
                },
                SETTINGS
            )
        ).toEqual<AnnotationsResult>([
            {
                title: '📟 Prometheus metric: random_numbers',
                url: 'https://example.com/?q=random_numbers',
                range: {
                    start: { line: 2, character: 14 },
                    end: { line: 2, character: 28 },
                },
            },
        ])
    })
})
