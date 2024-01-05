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
}

export function scopedCache<T>(cache: Cache<unknown>, scope: string): Cache<T> {
    function scopedKey(key: string): string {
        return `${scope}:${key}`
    }
    return {
        keyPrefix: scope,
        get: async key => cache.get(scopedKey(key)) as Promise<T | null>,
        set: async (key, value) => cache.set(scopedKey(key), value),
    }
}

export const noopCache: Cache<unknown> = {
    keyPrefix: 'noop',
    get: async () => Promise.resolve(null),
    set: async () => {},
}
