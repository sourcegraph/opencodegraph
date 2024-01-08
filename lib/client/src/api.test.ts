import { type ItemsParams, type ItemsResult } from '@openctx/protocol'
import { type Range } from '@openctx/schema'
import { of } from 'rxjs'
import { TestScheduler } from 'rxjs/testing'
import { describe, expect, test } from 'vitest'
import { observeItems, type Item, type ProviderClientWithSettings } from './api'

const FIXTURE_PARAMS: ItemsParams = {
    file: 'file:///f',
    content: 'A',
}

function fixtureProviderResult(label: string): ItemsResult {
    return [
        {
            title: label.toUpperCase(),
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
        },
    ]
}

function fixtureResult(label: string): Item {
    return {
        title: label.toUpperCase(),
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
    }
}

describe('observeItems', () => {
    const testScheduler = (): TestScheduler =>
        new TestScheduler((actual, expected) => expect(actual).toStrictEqual(expected))

    const OPTS: Parameters<typeof observeItems>[2] = { makeRange: r => r }

    test('simple', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            expectObservable(
                observeItems<Range>(
                    cold<ProviderClientWithSettings[]>('a', {
                        a: [{ providerClient: { items: () => of(fixtureProviderResult('a')) }, settings: {} }],
                    }),
                    FIXTURE_PARAMS,
                    OPTS
                )
            ).toBe('a', { a: [fixtureResult('a')] } satisfies Record<string, Item[]>)
        })
    })

    test('no providers', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            expectObservable(
                observeItems<Range>(
                    cold<ProviderClientWithSettings[]>('a', {
                        a: [],
                    }),
                    FIXTURE_PARAMS,
                    OPTS
                )
            ).toBe('a', { a: [] } satisfies Record<string, Item[]>)
        })
    })

    test('2 providers', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            expectObservable(
                observeItems<Range>(
                    cold<ProviderClientWithSettings[]>('a', {
                        a: [
                            { providerClient: { items: () => of(fixtureProviderResult('a')) }, settings: {} },
                            { providerClient: { items: () => of(fixtureProviderResult('b')) }, settings: {} },
                        ],
                    }),
                    FIXTURE_PARAMS,
                    OPTS
                )
            ).toBe('a', { a: [fixtureResult('a'), fixtureResult('b')] } satisfies Record<string, Item[]>)
        })
    })

    test('provider error', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            const erroringProvider: ProviderClientWithSettings = {
                providerClient: {
                    items: () => {
                        throw new Error('erroringProvider')
                    },
                },
                settings: {},
            }
            expectObservable(
                observeItems<Range>(
                    cold<ProviderClientWithSettings[]>('a', {
                        a: [
                            erroringProvider,
                            { providerClient: { items: () => of(fixtureProviderResult('b')) }, settings: {} },
                        ],

                        b: [erroringProvider],

                        c: [{ providerClient: { items: () => of(fixtureProviderResult('b')) }, settings: {} }],
                    }),
                    FIXTURE_PARAMS,
                    OPTS
                )
            ).toBe('a', { a: [fixtureResult('b')], b: [], c: [fixtureResult('b')] } satisfies Record<
                string,
                Item[]
            >)
        })
    })

    test('config changes', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            expectObservable(
                observeItems<Range>(
                    cold<ProviderClientWithSettings[]>('a-b', {
                        a: [{ providerClient: { items: () => of(fixtureProviderResult('a')) }, settings: {} }],
                        b: [
                            { providerClient: { items: () => of(fixtureProviderResult('a')) }, settings: {} },
                            { providerClient: { items: () => of(fixtureProviderResult('b')) }, settings: {} },
                        ],
                    }),
                    FIXTURE_PARAMS,
                    OPTS
                )
            ).toBe('a-b', {
                a: [fixtureResult('a')],
                b: [fixtureResult('a'), fixtureResult('b')],
            } satisfies Record<string, Item[]>)
        })
    })
})
