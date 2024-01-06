/// <reference lib="dom" />

import IndexedDBStorage from 'better-localstorage'
import { type CacheStore } from '../cache'

/**
 * Create a {@link CacheStore} that stores cache data using IndexedDB.
 */
export function createIndexedDBCacheStore(keyPrefix: string): CacheStore {
    // Use keyPrefix as the IndexedDB database name, which means we don't need to use it as the
    // actual entry key prefix in the DB.
    const storage = new IndexedDBStorage(keyPrefix)

    return {
        async get(key) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const data = await storage.getItem(key)
            try {
                return data ?? null
            } catch (error) {
                // TODO(sqs): cast because https://github.com/dreamsavior/Better-localStorage/pull/1
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                await (storage as any).delete(key)
                throw error
            }
        },
        async set(key, value) {
            try {
                await storage.setItem(key, value)
            } catch (error) {
                console.error(`failed to store data for ${key}`, error)
            }
        },
    }
}
