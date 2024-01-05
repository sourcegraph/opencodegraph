import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { type CacheStore } from '../cache'

/**
 * Create a {@link CacheStore} that stores cache data in the file system.
 */
export function createFileSystemCacheStore(basePath: string): CacheStore {
    function cacheFilePath(key: string): string {
        return path.join(basePath, `${key.replaceAll('/', '_')}.json`)
    }

    return {
        async get(key) {
            try {
                const data = await readFile(cacheFilePath(key), 'utf8')
                return JSON.parse(data)
            } catch (error: any) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if ('code' in error && error.code === 'ENOENT') {
                    return null
                }
                throw error
            }
        },
        async set(key, value) {
            const filePath = cacheFilePath(key)
            await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 })
            await writeFile(filePath, JSON.stringify(value, null, 2))
        },
    }
}
