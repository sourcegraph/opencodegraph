import { describe, expect, test } from 'vitest'
import { groupItems, prepareItemsForPresentation } from './ui'

describe('prepareItemsForPresentation', () => {
    test('applies hints', () => {
        expect(
            prepareItemsForPresentation([
                {
                    title: '📟 http_request_queue (metric)',
                    ui: {
                        presentationHints: ['show-at-top-of-file'],
                    },
                    range: {
                        start: { line: 3, character: 4 },
                        end: { line: 5, character: 6 },
                    },
                },
            ])
        ).toEqual<ReturnType<typeof prepareItemsForPresentation>>([
            {
                title: '📟 http_request_queue (metric)',
                ui: {
                    presentationHints: ['show-at-top-of-file'],
                },
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 0 },
                },
                originalRange: {
                    start: { line: 3, character: 4 },
                    end: { line: 5, character: 6 },
                },
            },
        ])
    })
})

describe('groupItems', () => {
    test('groups items', () => {
        expect(
            groupItems([
                {
                    title: '📘 Docs: Page 1',
                    url: 'https://example.com/1',
                    ui: { detail: 'Detail 1', group: 'Docs' },
                },
                {
                    title: '📘 Docs: Page 2',
                    url: 'https://example.com/2',
                    ui: { group: 'Docs' },
                },
                {
                    title: '📟 http_request_queue (metric)',
                },
            ])
        ).toEqual<ReturnType<typeof groupItems>>({
            groups: [
                [
                    'Docs',
                    [
                        {
                            title: '📘 Docs: Page 1',
                            url: 'https://example.com/1',
                            ui: { detail: 'Detail 1', group: 'Docs' },
                        },
                        {
                            title: '📘 Docs: Page 2',
                            url: 'https://example.com/2',
                            ui: { group: 'Docs' },
                        },
                    ],
                ],
            ],
            ungrouped: [
                {
                    title: '📟 http_request_queue (metric)',
                },
            ],
        })
    })
})
