import { describe, expect, test } from 'vitest'
import { createTestCache } from './cache.test'
import { memo } from './memo'

describe('memo', () => {
    test('memoizes', async () => {
        let calls = 0
        const fn = () => {
            calls++
            return Promise.resolve(true)
        }
        const { data, cache } = createTestCache()

        const v0 = await memo(cache, 'k', fn)
        expect(v0).toBe(true)
        expect(calls).toBe(1)
        expect(data.size).toBe(1)

        const v1 = await memo(cache, 'k', fn)
        expect(v1).toBe(true)
        expect(calls).toBe(1)
        expect(data.size).toBe(1)
    })
})
