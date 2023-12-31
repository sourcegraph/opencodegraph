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
    isTargetDoc?: boolean
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
    if (hints.isTargetDoc) {
        return chunkBySeparator(text, /(?:\r?\n){2,}(?=\S)/, text => text.trim()).filter(
            chunk => !chunk.text.startsWith('import ')
        )
    }
    return [{ text, range: { start: 0, end: text.length } }]
}

function chunkBySeparator(text: string, separator: RegExp, transform?: (text: string) => string): Chunk[] {
    const chunks: Chunk[] = []
    const parts = text.split(new RegExp(`(${separator.source})`, separator.flags))
    let lastSep: string | undefined
    for (const [i, part] of parts.entries()) {
        const isSep = i % 2 === 1
        if (isSep) {
            lastSep = part
        } else {
            const lastChunkEnd = chunks.at(-1)?.range.end ?? 0
            const lastSepLength = lastSep?.length ?? 0
            const text = (lastSep ?? '') + part
            chunks.push({
                text: transform ? transform(text) : text,
                range: {
                    start: lastChunkEnd + lastSepLength,
                    end: lastChunkEnd + lastSepLength + part.length,
                },
            })
        }
    }
    return chunks
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
