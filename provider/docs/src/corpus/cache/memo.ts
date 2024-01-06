import { LRUCache } from 'lru-cache'
import { type Cache } from './cache'

/**
 * Memoize an operation using the cache. Asynchronous operations will be single-flighted as well.
 *
 * The alternate form with `toJSONValue` and `fromJSONValue` is for when the value is not directly
 * JSON-serializable, such as `Float32Array`.
 */
export async function memo<T>(cache: Cache<unknown>, key: string, fn: () => Promise<T>): Promise<T>
export async function memo<T>(
    cache: Cache<unknown>,
    key: string,
    fn: () => Promise<any>,
    toJSONValue: (value: T) => any,
    fromJSONValue: (jsonValue: any) => T
): Promise<T>
export async function memo<T>(
    cache: Cache<unknown>,
    key: string,
    fn: () => Promise<any>,
    toJSONValue?: (value: T) => any,
    fromJSONValue?: (jsonValue: any) => T
): Promise<T> {
    // Check if cache entry exists.
    const memoized = await (cache as Cache<T>).get(key)
    if (memoized !== null) {
        log(key, 'HIT')
        return fromJSONValue ? fromJSONValue(memoized) : memoized
    }

    // Check if operation is already in-flight.
    const fullKey = cache.fullKey(key)
    const inflightOp = inflightOperations.get(fullKey)
    if (inflightOp !== undefined) {
        log(key, 'WAIT')
        return inflightOp
    }

    log(key, 'MISS')
    const op = fn()
    inflightOperations.set(fullKey, op)

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await op
        await (cache as Cache<T>).set(key, toJSONValue ? toJSONValue(result) : result)
        return result
    } finally {
        // Delete the in-flight operation (but confirm it's the one that we added to avoid a race
        // condition).
        const existingOp = inflightOperations.get(fullKey)
        if (existingOp === op) {
            inflightOperations.delete(fullKey)
        }
    }
}

const VERBOSE_MEMO: string | boolean = true

function log(key: string, message: string): void {
    if (VERBOSE_MEMO === true || (typeof VERBOSE_MEMO === 'string' && key.includes(VERBOSE_MEMO))) {
        console.debug(`cache:${key} ${message}`)
    }
}

const inflightOperations = new LRUCache<string, Promise<any>>({ max: 20 })
