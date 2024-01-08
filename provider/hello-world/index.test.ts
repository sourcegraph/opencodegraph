import { type ItemsResult, type CapabilitiesResult } from '@openctx/provider'
import { describe, expect, test } from 'vitest'
import helloWorld from './index'

describe('helloWorld', () => {
    test('capabilities', () => expect(helloWorld.capabilities({}, {})).toStrictEqual<CapabilitiesResult>({}))

    test('items', () =>
        expect(
            helloWorld.items(
                {
                    file: 'file:///a',
                    content: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'].join('\n'),
                },
                {}
            )
        ).toStrictEqual<ItemsResult>([
            {
                title: '✨ Hello, world!',
                url: 'https://openctx.org',
                ui: {
                    detail: 'From OpenCtx',
                },
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 1 },
                },
            },
            {
                title: '✨ Hello, world!',
                url: 'https://openctx.org',
                ui: {
                    detail: 'From OpenCtx',
                },
                range: {
                    start: { line: 10, character: 0 },
                    end: { line: 10, character: 1 },
                },
            },
        ]))
})
