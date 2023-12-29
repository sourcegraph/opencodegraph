import { type AnnotationsResult, type ProviderSettings } from '@opencodegraph/protocol'
import { describe, expect, test, vi } from 'vitest'
import { type Logger } from '../logger'
import { createProviderClient } from './createProviderClient'

function testdataFileUri(file: string): string {
    return `file://${__dirname}/testdata/${file}`
}

describe('createProviderClient', () => {
    test('simple', async () => {
        const pc = createProviderClient(testdataFileUri('provider.js'))
        const settings: ProviderSettings = { myTitle: 'ABC' }

        // File URI that satisfies the provider's selector.
        expect(
            await pc.annotations({ file: 'file:///foo', content: 'A\nB\nC\nD' }, settings)
        ).toStrictEqual<AnnotationsResult | null>([
            {
                title: 'ABC',
                range: { start: { line: 1, character: 2 }, end: { line: 3, character: 4 } },
            },
        ])

        // File URI that does NOT satisfy the provider's selector.
        expect(
            await pc.annotations({ file: 'file:///xxx', content: 'A' }, settings)
        ).toStrictEqual<AnnotationsResult | null>(null)
    })

    describe('error handling', () => {
        test('top-level throw', async () => {
            const logger = vi.fn((() => {}) as Logger)
            const pc = createProviderClient(testdataFileUri('topLevelThrow.js'), { logger })
            await expect(pc.annotations({ file: 'file:///f', content: 'A' }, {})).rejects.toThrow('topLevelThrow')
            expect(logger.mock.lastCall?.[0]).toContain('Error: topLevelThrow')
        })

        test('throw in capabilities', async () => {
            const logger = vi.fn((() => {}) as Logger)
            const pc = createProviderClient(testdataFileUri('capabilitiesThrow.js'), { logger })
            await expect(pc.annotations({ file: 'file:///f', content: 'A' }, {})).rejects.toThrow('capabilitiesThrow')
            expect(logger.mock.lastCall?.[0]).toContain('Error: capabilitiesThrow')
        })

        test('throw in annotations', async () => {
            const logger = vi.fn((() => {}) as Logger)
            const pc = createProviderClient(testdataFileUri('annotationsThrow.js'), { logger })
            await expect(pc.annotations({ file: 'file:///f', content: 'A' }, {})).rejects.toThrow('annotationsThrow')
            expect(logger.mock.lastCall?.[0]).toContain('Error: annotationsThrow')
        })
    })

    test('transport reuse', async () => {
        // We don't want the transport to be recreated each time. Specifically:
        //
        // - For all transports, the client should call `capabilities` once.
        // - For local module file transports, the module should be imported once.

        // Testing hack: communicate with the transportReuse.js module using a global var.
        const info = {
            moduleLoads: 0,
            capabilitiesCalls: 0,
            annotationsCalls: 0,
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ;(global as any).__test__transportReuseInfo = info

        const pc0 = createProviderClient(testdataFileUri('transportReuse.js'), {})
        expect(info.moduleLoads).toBe(0)
        expect(info.capabilitiesCalls).toBe(0)
        expect(info.annotationsCalls).toBe(0)

        await pc0.annotations({ file: 'file:///f0', content: 'A0' }, {})
        expect(info.moduleLoads).toBe(1)
        expect(info.capabilitiesCalls).toBe(1)
        expect(info.annotationsCalls).toBe(1)

        await pc0.annotations({ file: 'file:///f1', content: 'A1' }, {})
        expect(info.moduleLoads).toBe(1)
        expect(info.capabilitiesCalls).toBe(1)
        expect(info.annotationsCalls).toBe(2)

        // Now create a new provider client from the same module.
        const pc1 = createProviderClient(testdataFileUri('transportReuse.js'), {})
        expect(info.moduleLoads).toBe(1)
        expect(info.capabilitiesCalls).toBe(1)
        expect(info.annotationsCalls).toBe(2)

        await pc1.annotations({ file: 'file:///f2', content: 'A2' }, {})
        expect(info.moduleLoads).toBe(1)
        expect(info.capabilitiesCalls).toBe(2)
        expect(info.annotationsCalls).toBe(3)
    })
})
