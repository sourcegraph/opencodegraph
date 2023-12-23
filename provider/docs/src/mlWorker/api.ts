export interface MLWorkerMessagePair<T extends string = string, A extends {} = {}, R extends {} = {}> {
    type: T
    request: { id: number; type: T; args: A }
    response: { id: number; result: R }
}

export interface MLWorkerEmbedTextMessage extends MLWorkerMessagePair<'embedText', string, Float32Array> {}
