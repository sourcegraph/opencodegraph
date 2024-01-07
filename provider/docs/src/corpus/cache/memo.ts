import { type Cache } from './cache'

/**
 * Memoize an operation using the cache.
 */
export async function memo<T>(cache: Cache<unknown>, key: string, fn: () => Promise<T>): Promise<T> {
    // Check if cache entry exists.
    const memoized = await (cache as Cache<T>).get(key)
    if (memoized !== null) {
        log(key, 'HIT')
        return memoized
    }

    log(key, 'MISS')
    const result = await fn()
    await (cache as Cache<T>).set(key, result)
    return result
}

const VERBOSE_MEMO = false

function log(key: string, message: string): void {
    if (VERBOSE_MEMO) {
        console.debug(`cache:${key} ${message}`)
    }
}
