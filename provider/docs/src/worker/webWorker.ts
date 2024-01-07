/// <reference lib="webworker" />

import { embedTextInThisScope } from '../search/embeddings.ts'
import { type WorkerEmbedTextMessage, type WorkerMessagePair } from './api.ts'

declare let self: DedicatedWorkerGlobalScope

onRequest<WorkerEmbedTextMessage>(
    'embedText',
    async (text: string): Promise<Float32Array> => embedTextInThisScope(text, console.debug)
)

// Tell our host we are ready.
self.postMessage('ready')

function onRequest<P extends WorkerMessagePair>(
    type: P['type'],
    handler: (args: P['request']['args']) => Promise<P['response']['result']>
): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    self.addEventListener('message', async event => {
        const request = event.data as P['request']
        if (request.type === type) {
            const response: P['response'] = { id: request.id, result: await handler(request.args) }
            self.postMessage(response)
        }
    })
}
