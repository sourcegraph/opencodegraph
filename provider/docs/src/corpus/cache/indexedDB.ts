/// <reference lib="dom" />

import IndexedDBStorage from 'better-localstorage'
import { type ContentID, type CorpusCache } from './cache'

/**
 * Create a {@link CorpusCache} that stores cache data using IndexedDB.
 */
export function createIndexedDBCorpusCache(keyPrefix: string): CorpusCache {
    const storage = new IndexedDBStorage(keyPrefix)

    function storageKey(contentID: ContentID, key: string): string {
        return `${keyPrefix}:${contentID}:${key}`
    }

    return {
        async get(contentID, key) {
            const k = storageKey(contentID, key)
            const data = await storage.getItem(k)
            try {
                return data ?? null
            } catch (error) {
                // TODO(sqs): cast because https://github.com/dreamsavior/Better-localStorage/pull/1
                await (storage as any).delete(k)
                throw error
            }
        },
        async set(contentID, key, value) {
            try {
                await storage.setItem(storageKey(contentID, key), value)
            } catch (error) {
                console.error(`failed to store data for ${contentID}:${key}`, error)
            }
        },
    }
}
