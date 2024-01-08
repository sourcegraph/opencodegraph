import { type AnnotationsParams } from '@opencodegraph/protocol'
import { type Range } from '@opencodegraph/schema'
import { firstValueFrom, of } from 'rxjs'
import { TestScheduler } from 'rxjs/testing'
import { describe, expect, test } from 'vitest'
import { type Annotation } from '../api'
import { type ConfigurationUserInput } from '../configuration'
import { createClient, type Client, type ClientEnv } from './client'

function testdataFileUri(file: string): string {
    return `file://${__dirname}/testdata/${file}`
}

const FIXTURE_PARAMS: AnnotationsParams = {
    file: 'file:///f',
    content: 'A',
}

function fixtureResult(label: string): Annotation {
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

    describe('annotations', () => {
        test('with providers', async () => {
            const client = createTestClient({
                configuration: () =>
                    Promise.resolve({ enable: true, providers: { [testdataFileUri('simple.js')]: {} } }),
            })

            const anns = await client.annotations(FIXTURE_PARAMS)
            expect(anns).toStrictEqual<typeof anns>([
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

            const anns = await firstValueFrom(client.annotationsChanges(FIXTURE_PARAMS))
            expect(anns).toStrictEqual<typeof anns>([])
        })
    })

    test('annotationsChanges', () => {
        testScheduler().run(({ cold, expectObservable }) => {
            expectObservable(
                createTestClient({
                    authInfo: () => cold('a', { a: null }),
                    configuration: () =>
                        cold<ConfigurationUserInput>('a', {
                            a: { enable: true, providers: { [testdataFileUri('simple.js')]: {} } },
                        }),
                    __mock__: {
                        getProviderClient: () => ({ annotations: () => of([fixtureResult('a')]) }),
                    },
                }).annotationsChanges(FIXTURE_PARAMS)
            ).toBe('(0a)', { '0': [], a: [fixtureResult('a')] } satisfies Record<string, Annotation[]>)
        })
    })
})
