import { readFile } from 'node:fs/promises'
import { type CapabilitiesResult, type ResponseMessage } from '@opencodegraph/protocol'
import { afterEach } from 'node:test'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'
import { createTransport, type ProviderTransport } from './createTransport'

async function expectProviderTransport(provider: ProviderTransport) {
    expect(await provider.capabilities({}, {})).toEqual<CapabilitiesResult>({ selector: [{ path: 'foo' }] })
}

function testdataFileUri(file: string): string {
    return `file://${__dirname}/testdata/${file}`
}

describe('createTransport', () => {
    const fetchMocker = createFetchMock(vi)
    beforeAll(() => fetchMocker.enableMocks())
    afterEach(() => fetchMocker.resetMocks())
    afterAll(() => fetchMocker.disableMocks())

    describe('module file', () => {
        test('ESM .mjs', () => expectProviderTransport(createTransport(testdataFileUri('esmExtProvider.mjs'), {})))

        test('ESM .js', () => expectProviderTransport(createTransport(testdataFileUri('esmProvider.js'), {})))

        test('ESM .ts', () => expectProviderTransport(createTransport(testdataFileUri('esmProvider.ts'), {})))

        test('CommonJS .cjs', () =>
            expectProviderTransport(createTransport(testdataFileUri('commonjsExtProvider.cjs'), {})))

        test('CommonJS .js', () => expectProviderTransport(createTransport(testdataFileUri('commonjsProvider.js'), {})))

        test('not found', async () => {
            const provider = createTransport('file:///doesnotexist', {})
            await expect(() => provider.capabilities({}, {})).rejects.toMatch(/Failed to load/)
        })
    })

    describe('dynamicImport options', () => {
        test('dynamicImportFromUri local', async () => {
            const provider = createTransport('file:///myProvider.js', {
                dynamicImportFromUri(uri) {
                    expect(uri).toBe('file:///myProvider.js')
                    return Promise.resolve({
                        default: {
                            capabilities: () => ({ selector: [{ path: 'asdf' }] }),
                            annotations: () => [],
                        },
                    })
                },
            })
            expect(await provider.capabilities({}, {})).toEqual({ selector: [{ path: 'asdf' }] })
        })

        test('dynamicImportFromUri remote', async () => {
            const provider = createTransport('http://example.com/myProvider.js', {
                dynamicImportFromUri(uri) {
                    expect(uri).toBe('http://example.com/myProvider.js')
                    return Promise.resolve({
                        default: {
                            capabilities: () => ({ selector: [{ path: 'asdf' }] }),
                            annotations: () => [],
                        },
                    })
                },
            })
            expect(await provider.capabilities({}, {})).toEqual({ selector: [{ path: 'asdf' }] })
        })

        test('dynamicImportFromSource', async () => {
            const content = await readFile(__dirname + '/testdata/esmProvider.js', 'utf8')
            fetchMocker.mockOnce(content, { headers: { 'Content-Type': 'text/javascript' } })

            const provider = createTransport('https://example.com/myProvider.js', {
                dynamicImportFromSource(uri, esmSource) {
                    expect(uri).toBe('https://example.com/myProvider.js')
                    expect(esmSource).toBe(content)
                    return Promise.resolve({
                        exports: {
                            default: {
                                capabilities: () => ({ selector: [{ path: 'asdf' }] }),
                                annotations: () => [],
                            },
                        },
                    })
                },
            })
            expect(await provider.capabilities({}, {})).toEqual({ selector: [{ path: 'asdf' }] })
        })
    })

    describe('HTTP file', () => {
        test('ESM .js', async () => {
            const content = await readFile(__dirname + '/testdata/esmProvider.js', 'utf8')
            fetchMocker.mockOnce(content, { headers: { 'Content-Type': 'text/javascript' } })
            const provider = createTransport('https://example.com/myProvider.js', {})
            await expectProviderTransport(provider)
        })

        test('arbitrary unicode', async () => {
            const content = await readFile(__dirname + '/testdata/emoji.js', 'utf8')
            fetchMocker.mockOnce(content, { headers: { 'Content-Type': 'text/javascript' } })
            const provider = createTransport('https://example.com/emoji.js', {})
            await expectProviderTransport(provider)
        })

        describe('errors', () => {
            test('bad Content-Type', async () => {
                fetchMocker.mockResponseOnce('', { status: 200, headers: { 'Content-Type': 'text/html' } })
                const provider = createTransport('https://example.com/a.js', {})
                await expect(provider.capabilities({}, {})).rejects.toMatch(/invalid Content-Type/)
            })

            test('HTTP error 404', async () => {
                fetchMocker.mockResponseOnce('', { status: 404 })
                const provider = createTransport('https://example.com/a.js', {})
                await expect(provider.capabilities({}, {})).rejects.toMatch(/404/)
            })
        })
    })

    describe('HTTP endpoint (integration)', () => {
        const fetchMocker = createFetchMock(vi)
        beforeAll(() => fetchMocker.enableMocks())
        afterEach(() => fetchMocker.resetMocks())
        afterAll(() => fetchMocker.disableMocks())

        test('simple', async () => {
            fetchMocker.mockOnce(
                JSON.stringify({
                    result: { selector: [{ path: 'foo' }] } satisfies CapabilitiesResult,
                } satisfies ResponseMessage)
            )
            const provider = createTransport('https://example.com/opencodegraph', {})
            await expectProviderTransport(provider)
        })

        describe('errors', () => {
            test('HTTP request error', async () => {
                fetchMocker.mockRejectOnce(new Error('network error'))
                const provider = createTransport('https://example.com/opencodegraph', {})
                await expect(provider.capabilities({}, {})).rejects.toMatch(/network error/)
            })

            test('HTTP error 404', async () => {
                fetchMocker.mockResponseOnce('', { status: 404 })
                const provider = createTransport('https://example.com/opencodegraph', {})
                await expect(provider.capabilities({}, {})).rejects.toMatch(/404/)
            })
        })
    })
})
