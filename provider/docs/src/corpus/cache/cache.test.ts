import { describe, expect, test } from 'vitest'
import { createCache, scopedCache, type Cache, type CacheStore } from './cache'

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

describe('scopedCache', () => {
    test('get and set', async () => {
        const { data, cache: parentCache } = createTestCache()
        const cache = scopedCache(parentCache, 's')
        await cache.set('k0', 'v0')
        await cache.set('k1', 'v1')
        await cache.set('k0', 'v2')
        expect(data.get('s:k0')).toBe('v2')
        expect(data.get('s:k1')).toBe('v1')
    })

    test('fullKey', () => {
        const { cache: cache0 } = createTestCache()

        const cache1 = scopedCache(cache0, 's1')
        expect(cache1.fullKey('k')).toBe('s1:k')

        const cache2 = scopedCache(cache1, 's2')
        expect(cache2.fullKey('k')).toBe('s1:s2:k')
    })
})
