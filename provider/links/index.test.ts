import { type AnnotationsResult, type CapabilitiesResult } from '@opencodegraph/provider'
import { describe, expect, test } from 'vitest'
import links, { type Settings } from './index'

describe('links', () => {
    const SETTINGS: Settings = {
        links: [
            {
                title: 'Foo',
                url: 'https://example.com/foo',
                path: '**/*.ts',
                type: 'docs',
                pattern: /foo/.source,
            },
            { title: 'Bar', url: 'https://example.com/bar', path: '**/*.go', type: 'docs', pattern: /bar/.source },
        ],
    }

    test('capabilities', async () => {
        expect(await links.capabilities({}, SETTINGS)).toStrictEqual<CapabilitiesResult>({
            selector: [{ path: '**/*.ts' }, { path: '**/*.go' }],
        })
    })

    test('annotations', () => {
        expect(
            links.annotations(
                {
                    file: 'file:///a/b.ts',
                    content: '0foo0\nbar\nbaz\n1foo1',
                },
                SETTINGS
            )
        ).toEqual<AnnotationsResult>([
            {
                title: '📘 Docs: Foo',
                url: 'https://example.com/foo',
                range: {
                    start: { line: 0, character: 1 },
                    end: { line: 0, character: 4 },
                },
            },
            {
                title: '📘 Docs: Foo',
                url: 'https://example.com/foo',
                range: {
                    start: { line: 3, character: 1 },
                    end: { line: 3, character: 4 },
                },
            },
        ])
    })

    test('patterns with capture groups', () => {
        const settingsWithCaptureGroups: Settings = {
            links: [
                {
                    title: 'Print $1 $3 $<mygroup>',
                    url: 'https://example.com/search?q=$<mygroup|queryEscape>',
                    description: '$<mygroup>',
                    path: '**',
                    pattern: /log\.Print\((\w+), (?<mygroup>[^)]+)\)/.source,
                },
            ],
        }
        expect(
            links.annotations({ file: 'file:///a/b.ts', content: 'log.Print(foo, b/a+r)' }, settingsWithCaptureGroups)
        ).toEqual<AnnotationsResult>([
            {
                title: 'Print foo $3 b/a+r',
                url: 'https://example.com/search?q=b%2Fa%2Br',
                ui: { detail: 'b/a+r', format: 'markdown' },
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 21 },
                },
            },
        ])
    })
})
