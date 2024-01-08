import { type Annotation } from '@opencodegraph/client'
import { TestScheduler } from 'rxjs/testing'
import { describe, expect, test, vi, type MockedObject } from 'vitest'
import type * as vscode from 'vscode'
import { URI } from 'vscode-uri'
import { type Controller } from '../../controller'
import { createMockController } from '../../controller.test'
import { createPosition, createRange, mockTextDocument } from '../../util/vscode.test'
import { createCodeLensProvider } from './codeLens'

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>
}

vi.mock(
    'vscode',
    () =>
        ({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            Range: function (): vscode.Range {
                return createRange(0, 0, 0, 0)
            } as any,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            EventEmitter: function () {
                return { event: null }
            } as any,
            Uri: URI,
            commands: {
                registerCommand: vi.fn(),
            },
            window: {
                createQuickPick: vi.fn(() => ({ onDidAccept: () => {} })),
            },
        }) satisfies RecursivePartial<typeof vscode>
)

function fixtureResult(label: string): Annotation<vscode.Range> {
    return {
        title: label.toUpperCase(),
        range: createRange(0, 0, 0, 1),
    }
}

function createTestProvider(): {
    controller: MockedObject<Controller>
    provider: ReturnType<typeof createCodeLensProvider>
} {
    const controller = createMockController()
    return { controller, provider: createCodeLensProvider(controller) }
}

describe('createCodeLensProvider', () => {
    const testScheduler = (): TestScheduler =>
        new TestScheduler((actual, expected) => expect(actual).toStrictEqual(expected))

    test('simple', () => {
        const { controller, provider } = createTestProvider()
        const doc = mockTextDocument()
        testScheduler().run(({ cold, expectObservable }): void => {
            controller.observeAnnotations.mockImplementation(doc => {
                expect(doc).toBe(doc)
                return cold<Annotation<vscode.Range>[] | null>('a', { a: [fixtureResult('a')] })
            })
            expectObservable(provider.observeCodeLenses(doc)).toBe('a', {
                a: [{ isResolved: true, range: createRange(0, 0, 0, 1), command: { title: 'A', command: 'noop' } }],
            } satisfies Record<string, vscode.CodeLens[] | null>)
        })
    })

    test('detail hover', () => {
        const { controller, provider } = createTestProvider()
        const doc = mockTextDocument()
        testScheduler().run(({ cold, expectObservable }): void => {
            controller.observeAnnotations.mockImplementation(doc =>
                cold<Annotation<vscode.Range>[] | null>('a', { a: [{ title: 'A', ui: { detail: 'D' } }] })
            )
            expectObservable(provider.observeCodeLenses(doc)).toBe('a', {
                a: [
                    {
                        isResolved: true,
                        range: createRange(0, 0, 0, 0),
                        command: {
                            title: 'A',
                            command: 'opencodegraph._showHover',
                            arguments: [doc.uri, createPosition(0, 0)],
                        },
                    },
                ],
            } satisfies Record<string, vscode.CodeLens[] | null>)
        })
    })

    test('prefer-link-over-detail', () => {
        const { controller, provider } = createTestProvider()
        const doc = mockTextDocument()
        testScheduler().run(({ cold, expectObservable }): void => {
            controller.observeAnnotations.mockImplementation(doc =>
                cold<Annotation<vscode.Range>[] | null>('a', {
                    a: [
                        {
                            title: 'A',
                            url: 'https://example.com',
                            ui: { detail: 'D', presentationHints: ['prefer-link-over-detail'] },
                        },
                    ],
                })
            )
            expectObservable(provider.observeCodeLenses(doc)).toBe('a', {
                a: [
                    {
                        isResolved: true,
                        range: createRange(0, 0, 0, 0),
                        command: {
                            title: 'A',
                            command: 'vscode.open',
                            arguments: [URI.parse('https://example.com')],
                        },
                    },
                ],
            } satisfies Record<string, vscode.CodeLens[] | null>)
        })
    })

    test('show-at-top-of-file', () => {
        const { controller, provider } = createTestProvider()
        const doc = mockTextDocument()
        testScheduler().run(({ cold, expectObservable }): void => {
            controller.observeAnnotations.mockImplementation(doc =>
                cold<Annotation<vscode.Range>[] | null>('a', {
                    a: [
                        {
                            title: 'A',
                            ui: { detail: 'D', presentationHints: ['show-at-top-of-file'] },
                            range: createRange(1, 2, 3, 4),
                        },
                    ],
                })
            )
            expectObservable(provider.observeCodeLenses(doc)).toBe('a', {
                a: [
                    {
                        isResolved: true,
                        range: createRange(0, 0, 0, 0),
                        command: {
                            title: 'A',
                            command: 'opencodegraph._showHover',
                            arguments: [doc.uri, createPosition(1, 2)],
                        },
                    },
                ],
            } satisfies Record<string, vscode.CodeLens[] | null>)
        })
    })

    test('grouped', () => {
        const { controller, provider } = createTestProvider()
        const doc = mockTextDocument()
        const FIXTURE_ANNS: Annotation<vscode.Range>[] = [
            { title: 'A', range: createRange(1, 0, 1, 0), ui: { group: 'G' } },
            { title: 'B', range: createRange(1, 0, 1, 0), ui: { group: 'G' } },
        ]
        testScheduler().run(({ cold, expectObservable }): void => {
            controller.observeAnnotations.mockImplementation(doc => {
                expect(doc).toBe(doc)
                return cold<Annotation<vscode.Range>[] | null>('a', {
                    a: FIXTURE_ANNS,
                })
            })
            expectObservable(provider.observeCodeLenses(doc)).toBe('a', {
                a: [
                    {
                        isResolved: true,
                        range: createRange(1, 0, 1, 0),
                        command: { title: 'G', command: 'opencodegraph._showGroup', arguments: ['G', FIXTURE_ANNS] },
                    },
                ],
            } satisfies Record<string, vscode.CodeLens[] | null>)
        })
    })
})
