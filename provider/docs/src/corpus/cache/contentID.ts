import { type webcrypto } from 'crypto'

/**
 * A unique identifier for a document's or chunk's content (based on a hash of the text).
 */
export type ContentID = string

export async function contentID(text: string): Promise<ContentID> {
    /// ///// console.count('contentID')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const crypto: webcrypto.Crypto = (globalThis as any).crypto || (await import('node:crypto')).default.webcrypto

    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}
