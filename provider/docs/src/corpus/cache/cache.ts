import { type webcrypto } from 'node:crypto'

/**
 * A unique identifier for a document's or chunk's content (based on a hash of the text).
 */
export type ContentID = string

export async function contentID(text: string): Promise<ContentID> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const crypto: webcrypto.Crypto = (globalThis as any).crypto || (await import('node:crypto')).default.webcrypto

    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

export interface CorpusCache<T = unknown> {
    get(contentID: ContentID, key: string): Promise<T | null>
    set(contentID: ContentID, key: string, value: T): Promise<void>
}

export function scopedCache<T>(cache: CorpusCache<unknown>, scope: string): CorpusCache<T> {
    function scopedKey(key: string): string {
        return `${scope}-${key}`
    }
    const scopedCache = {
        get: async (contentID, key) => cache.get(contentID, scopedKey(key)) as Promise<T | null>,
        set: async (contentID, key, value) => cache.set(contentID, scopedKey(key), value),
        scope,
    } satisfies CorpusCache<T> & ScopedCache
    return scopedCache
}

interface ScopedCache {
    scope: string
}

function cacheScope(cache: CorpusCache<unknown>): string | null {
    function isScopedCache(cache: CorpusCache<unknown>): cache is ScopedCache & CorpusCache<unknown> {
        return 'scope' in cache && typeof cache.scope === 'string'
    }
    return isScopedCache(cache) ? cache.scope : null
}

/**
 * Memoize an operation using the cache.
 *
 * The alternate form with `toJSONValue` and `fromJSONValue` is for when the value is not directly
 * JSON-serializable, such as `Float32Array`.
 */
export async function memo<T>(cache: CorpusCache<unknown>, text: string, key: string, fn: () => Promise<T>): Promise<T>
export async function memo<T>(
    cache: CorpusCache<unknown>,
    text: string,
    key: string,
    fn: () => Promise<any>,
    toJSONValue: (value: T) => any,
    fromJSONValue: (jsonValue: any) => T
): Promise<T>
export async function memo<T>(
    cache: CorpusCache<unknown>,
    text: string,
    key: string,
    fn: () => Promise<any>,
    toJSONValue?: (value: T) => any,
    fromJSONValue?: (jsonValue: any) => T
): Promise<T> {
    const cid = await contentID(text)
    const memoized = await (cache as CorpusCache<T>).get(cid, key)
    if (memoized !== null) {
        // console.log(`cache:${cacheScope(cache)} HIT`)
        return fromJSONValue ? fromJSONValue(memoized) : memoized
    }
    // console.log(`cache:${cacheScope(cache)} MISS`)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await fn()
    await (cache as CorpusCache<T>).set(cid, key, toJSONValue ? toJSONValue(result) : result)
    return result
}

export const noopCache: CorpusCache<unknown> = {
    get: async () => Promise.resolve(null),
    set: async () => {},
}
