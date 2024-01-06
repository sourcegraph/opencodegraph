/**
 * The low-level storage backend for a {@link Cache}.
 */
export interface CacheStore {
    /** @returns null if no cache entry found */
    get(key: string): Promise<unknown>

    set(key: string, value: unknown): Promise<void>
}

/**
 * The high-level interface for a cache.
 */
export interface Cache<T = unknown> {
    keyPrefix: string
    get(key: string): Promise<T | null>
    set(key: string, value: T): Promise<void>

    /**
     * The full key (including any key prefixes of this cache or its wrappers) that would be used to
     * store a cache entry with the given {@link key}.
     */
    fullKey(key: string): string
}

/**
 * Create a high-level {@link Cache} from an underlying {@link CacheStore} storage backend.
 */
export function createCache(store: CacheStore): Cache<unknown> {
    return {
        keyPrefix: '',
        get: async key => store.get(key),
        set: async (key, value) => store.set(key, value),
        fullKey: key => key,
    }
}

/**
 * Wrap {@link cache} and get/set all entries with the given {@link scope} as a key prefix.
 */
export function scopedCache<T>(cache: Cache<unknown>, scope: string): Cache<T> {
    function scopedKey(key: string): string {
        return cache.fullKey(`${scope}:${key}`)
    }
    return {
        keyPrefix: scope,
        get: async key => cache.get(scopedKey(key)) as Promise<T | null>,
        set: async (key, value) => cache.set(scopedKey(key), value),
        fullKey: key => scopedKey(key),
    }
}

/**
 * A no-op {@link Cache} that always misses and never stores.
 */
export const noopCache: Cache<unknown> = {
    keyPrefix: 'noop',
    get: async () => Promise.resolve(null),
    set: async () => {},
    fullKey: key => key,
}
