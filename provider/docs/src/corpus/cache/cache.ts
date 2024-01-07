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
    get(key: string): Promise<T | null>
    set(key: string, value: T): Promise<void>
}

/**
 * Create a high-level {@link Cache} from an underlying {@link CacheStore} storage backend.
 */
export function createCache(store: CacheStore): Cache<unknown> {
    return {
        get: async key => store.get(key),
        set: async (key, value) => store.set(key, value),
    }
}

/**
 * A no-op {@link Cache} that always misses and never stores.
 */
export const noopCache: Cache<unknown> = {
    get: async () => Promise.resolve(null),
    set: async () => {},
}