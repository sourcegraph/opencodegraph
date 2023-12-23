/**
 * Index of a {@link Chunk} in a {@link StoredDocument}.
 */
export type ChunkIndex = number

export interface Chunk {
    /**
     * The text of the chunk, stripped of semantically meaningless markup, punctuation, and content.
     * This text need not be present in the original document.
     */
    text: string

    /**
     * The range in the original document (as character offsets) represented by this chunk.
     */
    range: { start: number; end: number }
}

/**
 * Information about the document to help the chunker know how to split the content into logical
 * chunks.
 */
export interface ChunkerHints {
    isMarkdown?: boolean
}

/**
 * Split text into logical chunks (such as sections in a Markdown document).
 */
export function chunk(text: string, hints: ChunkerHints): Chunk[] {
    if (hints.isMarkdown) {
        return chunkMarkdown(text)
    }
    if (text.length === 0) {
        return []
    }
    return [{ text, range: { start: 0, end: text.length } }]
}

function chunkMarkdown(text: string): Chunk[] {
    const chunks: Chunk[] = []

    const sections = text.split(/^(#+\s*)/m)
    let pos = 0
    for (const section of sections) {
        if (section.length === 0) {
            continue
        }
        if (section.startsWith('#')) {
            pos += section.length
            continue
        }
        chunks.push({
            text: section.trim(),
            range: { start: pos, end: pos + section.length },
        })
    }

    return chunks
}
