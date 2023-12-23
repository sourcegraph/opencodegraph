/// <reference lib="dom" />

import { type ContentID, type CorpusCache } from './cache'

/**
 * Create a {@link CorpusCache} that stores cache data in localStorage (using the Web Storage API).
 */
export function createWebStorageCorpusCache(storage: Storage, keyPrefix: string): CorpusCache {
    function storageKey(contentID: ContentID, key: string): string {
        return `${keyPrefix}:${contentID}:${key}`
    }

    return {
        get(contentID, key) {
            const k = storageKey(contentID, key)
            const data = storage.getItem(k)
            try {
                return Promise.resolve(data === null ? null : JSON.parse(data))
            } catch (error) {
                storage.removeItem(k)
                throw error
            }
        },
        set(contentID, key, value) {
            const valueData = JSON.stringify(value)
            try {
                storage.setItem(storageKey(contentID, key), valueData)
            } catch {
                // console.error(`failed to store data for ${contentID}:${key}`, error)
            }
            return Promise.resolve()
        },
    }
}
