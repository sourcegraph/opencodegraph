import { type AnnotationsParams, type AnnotationsResult } from '@opencodegraph/protocol'
import { type Range } from '@opencodegraph/schema'
import { of } from 'rxjs'
import { TestScheduler } from 'rxjs/testing'
import { describe, expect, test } from 'vitest'
import { observeAnnotations, type Annotation, type ProviderClientWithSettings } from './api'

const FIXTURE_PARAMS: AnnotationsParams = {
    file: 'file:///f',
    content: 'A',
}

function fixtureProviderResult(label: string): AnnotationsResult {
    return [
        {
            title: label.toUpperCase(),
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
        },
    ]
}

function fixtureResult(label: string): Annotation {
    return {
        title: label.toUpperCase(),
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
    }
}

describe('observeAnnotations', () => {
    const testScheduler = (): TestScheduler =>
        new TestScheduler((actual, expected) => expect(actual).toStrictEqual(expected))

    const OPTS: Parameters<typeof observeAnnotations>[2] = { makeRange: r => r }

    test('simple', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            expectObservable(
                observeAnnotations<Range>(
                    cold<ProviderClientWithSettings[]>('a', {
                        a: [{ providerClient: { annotations: () => of(fixtureProviderResult('a')) }, settings: {} }],
                    }),
                    FIXTURE_PARAMS,
                    OPTS
                )
            ).toBe('a', { a: [fixtureResult('a')] } satisfies Record<string, Annotation[]>)
        })
    })

    test('no providers', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            expectObservable(
                observeAnnotations<Range>(
                    cold<ProviderClientWithSettings[]>('a', {
                        a: [],
                    }),
                    FIXTURE_PARAMS,
                    OPTS
                )
            ).toBe('a', { a: [] } satisfies Record<string, Annotation[]>)
        })
    })

    test('2 providers', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            expectObservable(
                observeAnnotations<Range>(
                    cold<ProviderClientWithSettings[]>('a', {
                        a: [
                            { providerClient: { annotations: () => of(fixtureProviderResult('a')) }, settings: {} },
                            { providerClient: { annotations: () => of(fixtureProviderResult('b')) }, settings: {} },
                        ],
                    }),
                    FIXTURE_PARAMS,
                    OPTS
                )
            ).toBe('a', { a: [fixtureResult('a'), fixtureResult('b')] } satisfies Record<string, Annotation[]>)
        })
    })

    test('provider error', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            const erroringProvider: ProviderClientWithSettings = {
                providerClient: {
                    annotations: () => {
                        throw new Error('erroringProvider')
                    },
                },
                settings: {},
            }
            expectObservable(
                observeAnnotations<Range>(
                    cold<ProviderClientWithSettings[]>('a', {
                        a: [
                            erroringProvider,
                            { providerClient: { annotations: () => of(fixtureProviderResult('b')) }, settings: {} },
                        ],

                        b: [erroringProvider],

                        c: [{ providerClient: { annotations: () => of(fixtureProviderResult('b')) }, settings: {} }],
                    }),
                    FIXTURE_PARAMS,
                    OPTS
                )
            ).toBe('a', { a: [fixtureResult('b')], b: [], c: [fixtureResult('b')] } satisfies Record<
                string,
                Annotation[]
            >)
        })
    })

    test('config changes', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            expectObservable(
                observeAnnotations<Range>(
                    cold<ProviderClientWithSettings[]>('a-b', {
                        a: [{ providerClient: { annotations: () => of(fixtureProviderResult('a')) }, settings: {} }],
                        b: [
                            { providerClient: { annotations: () => of(fixtureProviderResult('a')) }, settings: {} },
                            { providerClient: { annotations: () => of(fixtureProviderResult('b')) }, settings: {} },
                        ],
                    }),
                    FIXTURE_PARAMS,
                    OPTS
                )
            ).toBe('a-b', {
                a: [fixtureResult('a')],
                b: [fixtureResult('a'), fixtureResult('b')],
            } satisfies Record<string, Annotation[]>)
        })
    })
})
