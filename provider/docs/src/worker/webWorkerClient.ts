import { type embedTextInThisScope } from '../search/embeddings'
import { type WorkerEmbedTextMessage, type WorkerMessagePair } from './api'

export const embedTextOnWorker: typeof embedTextInThisScope = async (text: string): Promise<Float32Array> =>
    sendMessage<WorkerEmbedTextMessage>('embedText', text)

async function sendMessage<P extends WorkerMessagePair>(
    type: P['type'],
    args: P['request']['args']
): Promise<P['response']['result']> {
    const worker = await acquireWorker()
    const id = nextID()
    worker.postMessage({ id, type, args } satisfies P['request'])
    return new Promise<P['response']['result']>(resolve => {
        const onMessage = (event: MessageEvent): void => {
            const response = event.data as P['response']
            if (response.id === id) {
                resolve(response.result)
                worker.removeEventListener('message', onMessage)
            }
        }
        worker.addEventListener('message', onMessage)
    })
}

const NUM_WORKERS: number = Math.min(
    8,
    (await (async (): Promise<number> => {
        if (typeof navigator !== 'undefined') {
            return navigator.hardwareConcurrency
        }
        try {
            const os = await import('node:os')
            return os.cpus().length
            // eslint-disable-next-line no-empty
        } catch {}
        return 1
    })()) || 1
)

const workers: (Promise<Worker> | undefined)[] = []
let workerSeq = 0

/**
 * Acquire a worker from the pool. Currently the acquisition is round-robin.
 */
async function acquireWorker(): Promise<Worker> {
    const workerID = workerSeq++ % NUM_WORKERS
    let workerInstance = workers[workerID]
    if (!workerInstance) {
        workerInstance = new Promise<Worker>(resolve => {
            const worker = new Worker(new URL('./webWorker.ts', import.meta.url), { type: 'module' })

            // Wait for worker to become ready. It sends a message when it is ready. The actual message
            // doesn't matter.
            worker.addEventListener('message', () => resolve(worker))
        })
        console.log('worker', workerID, 'is ready')
        workers[workerID] = workerInstance
    }
    return workerInstance
}

let id = 1
function nextID(): number {
    return id++
}
