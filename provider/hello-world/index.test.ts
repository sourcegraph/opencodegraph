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
                item: {
                    title: '✨ Hello, world!',
                    detail: 'From OpenCodeGraph',
                    url: 'https://opencodegraph.org',
                },
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 1 },
                },
            },
            {
                item: {
                    title: '✨ Hello, world!',
                    detail: 'From OpenCodeGraph',
                    url: 'https://opencodegraph.org',
                },
                range: {
                    start: { line: 10, character: 0 },
                    end: { line: 10, character: 1 },
                },
            },
        ]))
})
