import { type Cache } from './cache'
import { contentID } from './contentID'

/**
 * Memoize an operation using the cache.
 *
 * The alternate form with `toJSONValue` and `fromJSONValue` is for when the value is not directly
 * JSON-serializable, such as `Float32Array`.
 */

export async function memo<T>(cache: Cache<unknown>, text: string, key: string, fn: () => Promise<T>): Promise<T>
export async function memo<T>(
    cache: Cache<unknown>,
    text: string,
    key: string,
    fn: () => Promise<any>,
    toJSONValue: (value: T) => any,
    fromJSONValue: (jsonValue: any) => T
): Promise<T>
export async function memo<T>(
    cache: Cache<unknown>,
    text: string,
    key: string,
    fn: () => Promise<any>,
    toJSONValue?: (value: T) => any,
    fromJSONValue?: (jsonValue: any) => T
): Promise<T> {
    const cid = await contentID(text)
    const memoized = await (cache as Cache<T>).get(cid, key)
    if (memoized !== null) {
        // console.log(`cache:${cacheScope(cache)} HIT`)
        return fromJSONValue ? fromJSONValue(memoized) : memoized
    }
    // console.log(`cache:${cacheScope(cache)} MISS`)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await fn()
    await (cache as Cache<T>).set(cid, key, toJSONValue ? toJSONValue(result) : result)
    return result
}
