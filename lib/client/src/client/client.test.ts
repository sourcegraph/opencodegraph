import { type ItemsParams } from '@openctx/protocol'
import { type Range } from '@openctx/schema'
import { firstValueFrom, of } from 'rxjs'
import { TestScheduler } from 'rxjs/testing'
import { describe, expect, test } from 'vitest'
import { type Item } from '../api'
import { type ConfigurationUserInput } from '../configuration'
import { createClient, type Client, type ClientEnv } from './client'

function testdataFileUri(file: string): string {
    return `file://${__dirname}/testdata/${file}`
}

const FIXTURE_PARAMS: ItemsParams = {
    file: 'file:///f',
    content: 'A',
}

function fixtureResult(label: string): Item {
    return {
        title: label.toUpperCase(),
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
    }
}

function createTestClient(
    env: Partial<ClientEnv<Range>> & Required<Pick<ClientEnv<Range>, 'configuration'>>
): Client<Range> {
    return createClient<Range>({
        authInfo: () => of(null),
        makeRange: r => r,
        ...env,
    })
}

describe('Client', () => {
    const testScheduler = (): TestScheduler =>
        new TestScheduler((actual, expected) => expect(actual).toStrictEqual(expected))

    describe('items', () => {
        test('with providers', async () => {
            const client = createTestClient({
                configuration: () =>
                    Promise.resolve({ enable: true, providers: { [testdataFileUri('simple.js')]: {} } }),
            })

            const items = await client.items(FIXTURE_PARAMS)
            expect(items).toStrictEqual<typeof items>([
                {
                    title: 'A',
                    range: { start: { line: 1, character: 2 }, end: { line: 3, character: 4 } },
                },
            ])
        })

        test('no providers', async () => {
            const client = createTestClient({
                configuration: () => Promise.resolve({ providers: {} }),
            })

            const items = await firstValueFrom(client.itemsChanges(FIXTURE_PARAMS))
            expect(items).toStrictEqual<typeof items>([])
        })
    })

    test('itemsChanges', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            expectObservable(
                createTestClient({
                    authInfo: () => cold('a', { a: null }),
                    configuration: () =>
                        cold<ConfigurationUserInput>('a', {
                            a: { enable: true, providers: { [testdataFileUri('simple.js')]: {} } },
                        }),
                    __mock__: {
                        getProviderClient: () => ({ items: () => of([fixtureResult('a')]) }),
                    },
                }).itemsChanges(FIXTURE_PARAMS)
            ).toBe('(0a)', { '0': [], a: [fixtureResult('a')] } satisfies Record<string, Item[]>)
        })
    })
})
