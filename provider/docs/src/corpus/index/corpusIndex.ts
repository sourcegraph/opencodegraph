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
    return {
        docs,
        tfidf,
    }
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
