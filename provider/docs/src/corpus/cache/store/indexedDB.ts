/// <reference lib="dom" />

import IndexedDBStorage from 'better-localstorage'
import { type CacheStore } from '../cache'

/**
 * Create a {@link CacheStore} that stores cache data using IndexedDB.
 */
export function createIndexedDBCacheStore(keyPrefix: string): CacheStore {
    const storage = new IndexedDBStorage(keyPrefix)

    function storageKey(key: string): string {
        return `${keyPrefix}:${key}`
    }

    return {
        async get(key) {
            const k = storageKey(key)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const data = await storage.getItem(k)
            try {
                return data ?? null
            } catch (error) {
                // TODO(sqs): cast because https://github.com/dreamsavior/Better-localStorage/pull/1
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                await (storage as any).delete(k)
                throw error
            }
        },
        async set(key, value) {
            try {
                await storage.setItem(storageKey(key), value)
            } catch (error) {
                console.error(`failed to store data for ${key}`, error)
            }
        },
    }
}
