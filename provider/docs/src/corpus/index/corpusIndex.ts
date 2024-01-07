import { embedText } from '../../search/embeddings'
import { createTFIDFIndex, type TFIDFIndex } from '../../search/tfidf'
import { type CorpusArchive } from '../archive/corpusArchive'
import { contentID } from '../cache/contentID'
import { chunk, type Chunk } from '../doc/chunks'
import { type Content, type ContentExtractor } from '../doc/contentExtractor'
import { type Doc } from '../doc/doc'

/**
 * An index of a corpus.
 */
export interface CorpusIndex {
    // Index data
    docs: IndexedDoc[]
    tfidf: TFIDFIndex
}

/**
 * An indexed document.
 */
export interface IndexedDoc {
    doc: Pick<Doc, 'id' | 'url'>
    content: Pick<Content, 'title' | 'textContent'> | null

    /** The SHA-256 hash of the indexed content (including chunks). */
    contentID: string

    chunks: (Chunk & { embeddings: Float32Array })[]
}

/**
 * Index a corpus.
 */
export async function createCorpusIndex(
    archive: CorpusArchive,
    { contentExtractor }: { contentExtractor?: ContentExtractor } = {}
): Promise<CorpusIndex> {
    const docs = await indexCorpusDocs(archive, { contentExtractor })
    const tfidf = createTFIDFIndex(docs)
    const index: CorpusIndex = {
        docs,
        tfidf,
    }
    const serializable = {
        ...index,
        /** Handles serializing the Float32Array values. */
        toJSON: () => toJSON(index),
    }
    return serializable
}

async function indexCorpusDocs(
    corpus: CorpusArchive,
    { contentExtractor }: { contentExtractor?: ContentExtractor }
): Promise<IndexedDoc[]> {
    return Promise.all(
        corpus.docs.map(async doc => {
            const content = contentExtractor ? await contentExtractor.extractContent(doc) : null
            const chunks = chunk(content?.content ?? doc.text, { isMarkdown: doc.text.includes('##') })
            return {
                doc: { id: doc.id, url: doc.url },
                content:
                    content?.title && content?.textContent
                        ? { title: content.title, textContent: content.textContent }
                        : null,
                contentID: await contentID(JSON.stringify([doc, content, chunks])),
                chunks: await Promise.all(
                    chunks.map(async chunk => ({
                        ...chunk,
                        embeddings: await embedText(chunk.text),
                    }))
                ),
            } satisfies IndexedDoc
        })
    )
}

function toJSON(index: CorpusIndex): any {
    return {
        ...index,
        docs: index.docs.map(doc => ({
            ...doc,
            chunks: doc.chunks.map(chunk => ({
                ...chunk,
                embeddings: Array.from(chunk.embeddings),
            })),
        })),
    }
}

/**
 * Must be called on any {@link CorpusIndex} value that was deserialized using `JSON.parse`.
 */
export function fromJSON(indexData: any): CorpusIndex {
    return {
        ...indexData,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        docs: indexData.docs.map((doc: any) => ({
            ...doc,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            chunks: doc.chunks.map((chunk: any) => ({
                ...chunk,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                embeddings: new Float32Array(chunk.embeddings),
            })),
        })),
    }
}
