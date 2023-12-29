import { type AnnotationsResult, type CapabilitiesResult } from '@opencodegraph/provider'
import { describe, expect, test } from 'vitest'
import helloWorld from './index'

describe('helloWorld', () => {
    test('capabilities', () => expect(helloWorld.capabilities({}, {})).toStrictEqual<CapabilitiesResult>({}))

    test('annotations', () =>
        expect(
            helloWorld.annotations(
                {
                    file: 'file:///a',
                    content: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'].join('\n'),
                },
                {}
            )
        ).toStrictEqual<AnnotationsResult>([
            {
                title: '✨ Hello, world!',
                url: 'https://opencodegraph.org',
                ui: {
                    detail: 'From OpenCodeGraph',
                },
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 1 },
                },
            },
            {
                title: '✨ Hello, world!',
                url: 'https://opencodegraph.org',
                ui: {
                    detail: 'From OpenCodeGraph',
                },
                range: {
                    start: { line: 10, character: 0 },
                    end: { line: 10, character: 1 },
                },
            },
        ]))
})
