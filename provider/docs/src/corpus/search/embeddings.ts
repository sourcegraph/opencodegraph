import { cos_sim, dot, env, magnitude, pipeline } from '@xenova/transformers'
import * as onnxWeb from 'onnxruntime-web'
import { type CorpusIndex, type CorpusSearchResult, type Query } from '..'
import { useWebWorker } from '../../env'
import { type Logger } from '../../logger'
import { embedTextOnWorker } from '../../mlWorker/webWorkerClient'
import { contentID } from '../cache/contentID'
import { memo } from '../cache/memo'
import { type SearchOptions } from './multi'

// TODO(sqs): think we can remove this entirely...
//
// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
if (typeof process !== 'undefined' && process.env.FORCE_WASM) {
    // Force use of wasm backend for parity between Node.js and web.
    //
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    env.onnx = onnxWeb.env
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ;(env as any).onnx.wasm.numThreads = 1
}

env.allowLocalModels = false

export async function embeddingsSearch(
    index: CorpusIndex,
    query: Query,
    { cache, logger }: SearchOptions
): Promise<CorpusSearchResult[]> {
    const textToEmbed = [query.meta?.activeFilename && `// ${query.meta?.activeFilename}`, query.text]
        .filter((s): s is string => Boolean(s))
        .join('\n')
    const queryVec = await embedText(textToEmbed)
    const cosSim = cosSimWith(queryVec)

    const MIN_SCORE = 0.1

    // Compute embeddings in parallel.
    const results: CorpusSearchResult[] = (
        await Promise.all(
            index.docs.flatMap(({ doc, chunks }) =>
                chunks.map(async (chunk, i) => {
                    const chunkVec = await cachedEmbedText(chunk.text, { cache, logger })
                    const score = cosSim(chunkVec)
                    return score >= MIN_SCORE
                        ? ({ doc: doc.id, chunk: i, score, excerpt: chunk.text } satisfies CorpusSearchResult)
                        : null
                })
            )
        )
    ).filter((r): r is CorpusSearchResult => r !== null)

    results.sort((a, b) => b.score - a.score)

    return results.slice(0, 1)
}

async function cachedEmbedText(text: string, { cache, logger }: SearchOptions): Promise<Float32Array> {
    return memo(
        cache,
        `embedText:${await contentID(text)}`,
        () => embedText(text, logger),
        f32a => Array.from(f32a),
        arr => new Float32Array(arr)
    )
}

const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {})

/**
 * Embed the text and return the vector. Run in a worker in some environments.
 */
export const embedText = useWebWorker ? embedTextOnWorker : embedTextInThisScope

/**
 * Embed the text and return the vector.
 *
 * Run in the current scope (instead of in a worker in some environments).
 */
export async function embedTextInThisScope(text: string, logger?: Logger): Promise<Float32Array> {
    try {
        const t0 = performance.now()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const out = await pipe(text, { pooling: 'mean', normalize: true })
        logger?.(`embedText (${text.length} chars) took ${Math.round(performance.now() - t0)}ms`)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return out.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

function cosSimWith(a: Float32Array): (b: Float32Array) => number {
    const mA = magnitude(a)
    return b => dot(a, b) / (mA * magnitude(b))
}

/**
 * Compute the cosine similarity of the two texts' embeddings vectors.
 */
export async function similarity(text1: string, text2: string): Promise<number> {
    const emb1 = await embedTextInThisScope(text1)
    const emb2 = await embedTextInThisScope(text2)
    return cos_sim(emb1, emb2)
}

declare module '@xenova/transformers' {
    // These functions are declared in the @xenova/transformers module as only accepting
    // number[], but they accept Float32Array as well.
    export function cos_sim(a: Float32Array, b: Float32Array): number
    export function dot(a: Float32Array, b: Float32Array): number
    export function magnitude(arr: Float32Array): number
}
