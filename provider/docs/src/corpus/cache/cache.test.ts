import { describe, expect, test } from 'vitest'
import { createCache, type Cache, type CacheStore } from './cache'

export function createTestCache(): { data: Map<string, unknown>; store: CacheStore; cache: Cache } {
    const data = new Map<string, unknown>()
    const store: CacheStore = {
        get: key => Promise.resolve(data.get(key) ?? null),
        set: (key, value) => {
            data.set(key, value)
            return Promise.resolve(undefined)
        },
    }
    const cache = createCache(store)
    return { data, store, cache }
}

describe('Cache', () => {
    test('get and set', async () => {
        const { data, cache } = createTestCache()
        await cache.set('k0', 'v0')
        await cache.set('k1', 'v1')
        await cache.set('k0', 'v2')
        expect(data.get('k0')).toBe('v2')
        expect(data.get('k1')).toBe('v1')
    })
})
