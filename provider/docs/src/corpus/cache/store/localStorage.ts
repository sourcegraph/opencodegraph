/// <reference lib="dom" />

import { type CacheStore } from '../cache'

/**
 * Create a {@link CacheStore} that stores cache data in localStorage (using the Web Storage API).
 */
export function createWebStorageCacheStore(storage: Storage, keyPrefix: string): CacheStore {
    function storageKey(key: string): string {
        return `${keyPrefix}:${key}`
    }

    return {
        get(key) {
            const k = storageKey(key)
            const data = storage.getItem(k)
            try {
                return Promise.resolve(data === null ? null : JSON.parse(data))
            } catch (error) {
                storage.removeItem(k)
                throw error
            }
        },
        set(key, value) {
            const valueData = JSON.stringify(value)
            try {
                storage.setItem(storageKey(key), valueData)
            } catch {
                // console.error(`failed to store data for ${contentID}:${key}`, error)
            }
            return Promise.resolve()
        },
    }
}
