/// <reference lib="webworker" />

import { embedTextInThisScope } from '../corpus/search/embeddings'
import { type MLWorkerEmbedTextMessage, type MLWorkerMessagePair } from './api'

declare let self: DedicatedWorkerGlobalScope

onRequest<MLWorkerEmbedTextMessage>(
    'embedText',
    async (text: string): Promise<Float32Array> => embedTextInThisScope(text)
)

// Tell our host we are ready.
self.postMessage('ready')

function onRequest<P extends MLWorkerMessagePair>(
    type: P['type'],
    handler: (args: P['request']['args']) => Promise<P['response']['result']>
): void {
    self.addEventListener('message', async event => {
        const request = event.data as P['request']
        if (request.type === type) {
            const response: P['response'] = { id: request.id, result: await handler(request.args) }
            self.postMessage(response)
        }
    })
}
