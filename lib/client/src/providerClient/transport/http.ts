import {
    type AnnotationsResult,
    type CapabilitiesResult,
    type RequestMessage,
    type ResponseMessage,
} from '@openctx/protocol'
import { scopedLogger } from '../../logger'
import type { ProviderTransport, ProviderTransportOptions } from './createTransport'

export function createHttpTransport(
    providerUri: string,
    { authInfo, logger }: Pick<ProviderTransportOptions, 'authInfo' | 'logger'>
): ProviderTransport {
    logger = scopedLogger(logger, 'http')

    const url = new URL(providerUri)
    async function send<R>(req: RequestMessage): Promise<R> {
        if (logger) {
            // Omit `content` because can be very large.
            const paramsForLog =
                req.params && 'content' in (req.params as any) ? { ...req.params, content: undefined } : req.params
            logger?.(`${req.method} request: params=${JSON.stringify(paramsForLog)}`)
        }

        let resp: Response
        try {
            resp = await fetch(providerUri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    ...(url.protocol === 'https:' ? authInfo?.headers : {}),
                },
                body: JSON.stringify(req),
            })
        } catch (error: any) {
            throw new Error(
                `sending HTTP request to OpenCtx provider: ${[
                    `providerUri=${providerUri}`,
                    `method=${req.method}`,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    `error=${JSON.stringify('message' in error ? error.message : error)}`,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    error.cause ? `cause=${error.cause}` : null,
                ]
                    .filter(s => s)
                    .join(' ')}`
            )
        }

        if (!resp.ok) {
            throw new Error(`HTTP error ${resp.status} ${resp.statusText}`)
        }

        try {
            const { result, error } = (await resp.json()) as ResponseMessage
            logger?.(`${req.method} response: result=${JSON.stringify(result)} error=${JSON.stringify(error)}`)
            if (error) {
                throw new Error(
                    `OpenCtx response error: ${[
                        `providerUri=${providerUri}`,
                        `method=${req.method}`,
                        `error.code=${error.code}`,
                        `error.message=${JSON.stringify(error.message)}`,
                        `error.data=${JSON.stringify(error.data)}`,
                    ].join(' ')}`
                )
            }
            if (!result) {
                throw new Error('invalid OpenCtx response: missing "result" field')
            }
            return result as R
        } catch (error: any) {
            throw new Error(
                `reading JSON HTTP request body from OpenCtx provider: ${[
                    `providerUri=${providerUri}`,
                    `method=${req.method}`,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    `error=${JSON.stringify('message' in error ? error.message : error)}`,
                ].join(' ')}`
            )
        }
    }

    return {
        capabilities: async params => send<CapabilitiesResult>({ method: 'capabilities', params }),
        annotations: async params => send<AnnotationsResult>({ method: 'annotations', params }),
    }
}
