import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { type ContentID, type CorpusCache } from './cache'

/**
 * Create a {@link CorpusCache} that stores cache data in the file system.
 */
export function createFileSystemCorpusCache(basePath: string): CorpusCache {
    function cacheFilePath(contentID: ContentID, key: string): string {
        return path.join(basePath, `${contentID}-${key.replaceAll('/', '_')}.json`)
    }

    return {
        async get(contentID, key) {
            try {
                const data = await readFile(cacheFilePath(contentID, key), 'utf8')
                return JSON.parse(data)
            } catch (error: any) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if ('code' in error && error.code === 'ENOENT') {
                    return null
                }
                throw error
            }
        },
        async set(contentID, key, value) {
            const filePath = cacheFilePath(contentID, key)
            await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 })
            await writeFile(filePath, JSON.stringify(value, null, 2))
        },
    }
}
