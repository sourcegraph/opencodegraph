import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'
import { type Doc } from '../../doc/doc.ts'
import { createWebCorpusArchive, urlHasPrefix } from './webCorpusArchive.ts'

describe('createWebCorpusSource', () => {
    const fetchMocker = createFetchMock(vi)
    beforeAll(() => fetchMocker.enableMocks())
    afterEach(() => fetchMocker.resetMocks())
    afterAll(() => fetchMocker.disableMocks())

    test('crawls', async () => {
        type MockResponseInit = Parameters<typeof fetchMocker.mockResponse>[1] & { body: string }
        const mockPages: { [pathname: string]: MockResponseInit } = {
            '/docs': {
                url: 'https://example.com/docs/entry', // redirected
                body: 'Redirected',
            },
            '/docs/entry': {
                body: `
<h1>Docs</h1>
<p>See <a href="/docs/foo">foo</a> and <a href="/docs/bar">bar</a>.</p>
<p>See also <a href="/x">x</a>.
<a href="/docs">Docs home</a>
`,
            },
            '/docs/foo': {
                body: `
<h1>Foo</h1>
<p>See <a href="/docs/foo/a">foo/a</a>.</p>
`,
            },
            '/docs/foo/a': {
                body: `
<h1>Foo/a</h1>
<p>See <a href="/docs/foo">foo</a> and <a href="/docs">docs</a>.</p>
`,
            },
            '/docs/bar': {
                body: `
<h1>Bar</h1>
<p>See <a href="/docs/bar/a">bar/a</a>.</p>
`,
            },
            '/docs/bar/a': {
                status: 404,
                body: 'Not Found',
            },
        }
        fetchMocker.mockResponse(req => {
            const url = new URL(req.url)
            if (url.protocol !== 'https:' || url.host !== 'example.com') {
                throw new Error(`not mocked: ${req.url}`)
            }
            const resp = mockPages[url.pathname]
            if (resp) {
                return { url: url.toString(), ...resp }
            }
            throw new Error(`not mocked: ${req.url}`)
        })

        const archive = await createWebCorpusArchive({
            entryPage: new URL('https://example.com/docs/entry'),
            prefix: new URL('https://example.com/docs'),
        })
        expect(archive.docs).toEqual<Doc[]>([
            { id: 1, text: mockPages['/docs/entry'].body, url: 'https://example.com/docs/entry' },
            { id: 2, text: mockPages['/docs/foo'].body, url: 'https://example.com/docs/foo' },
            { id: 3, text: mockPages['/docs/bar'].body, url: 'https://example.com/docs/bar' },
            { id: 4, text: mockPages['/docs/foo/a'].body, url: 'https://example.com/docs/foo/a' },
        ])
    })

    test('respects canonical URLs', async () => {
        fetchMocker.mockResponse(
            `
            <html>
            <head>
                <link rel="canonical" href="https://example.com/a"/>
            </head>
            <body>
                <a href="/a">no trailing slash</a>
                <a href="/a/">trailing slash</a>
                <a href="/a/?page=foo">with querystring</a>
            </body>
            </html>`,
            { url: 'https://example.com/a/' }
        )
        const archive = await createWebCorpusArchive({
            entryPage: new URL('https://example.com/a/'),
            prefix: new URL('https://example.com'),
        })
        expect(archive.docs).toMatchObject<Omit<Doc, 'text'>[]>([{ id: 1, url: 'https://example.com/a' }])
    })
})

describe('urlHasPrefix', () => {
    test('same url', () =>
        expect(urlHasPrefix(new URL('https://example.com/a/b'), new URL('https://example.com/a/b'))).toBe(true))

    test('path prefix', () => {
        expect(urlHasPrefix(new URL('https://example.com/a/b'), new URL('https://example.com/a'))).toBe(true)
        expect(urlHasPrefix(new URL('https://example.com/a/b'), new URL('https://example.com/a/'))).toBe(true)
        expect(urlHasPrefix(new URL('https://example.com/a'), new URL('https://example.com/a/'))).toBe(true)
        expect(urlHasPrefix(new URL('https://example.com/a-b'), new URL('https://example.com/a'))).toBe(false)
    })

    test('query', () => {
        expect(urlHasPrefix(new URL('https://example.com/a?page=b'), new URL('https://example.com/a'))).toBe(true)
        expect(urlHasPrefix(new URL('https://example.com/a/b?page=c'), new URL('https://example.com/a'))).toBe(true)
    })
})
