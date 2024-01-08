import { type Provider } from '@openctx/provider/src/provider'
import { type AuthInfo, type ClientEnv } from '../../client/client'
import { type Logger } from '../../logger'
import { cachedTransport } from './cache'
import { createHttpTransport } from './http'
import { createLocalModuleFileTransport, createRemoteModuleFileTransport } from './module'

/**
 * A provider transport is a low-level TypeScript wrapper around the provider protocol. It is a
 * internal implementation detail; clients should not use it directly.
 *
 * @internal
 */
export type ProviderTransport = {
    // Make the Provider methods all async (i.e., so they return only `Promise<T>` not `T |
    // Promise<T>`).
    [K in Exclude<keyof Provider, 'dispose'>]: (
        ...args: Parameters<Provider[K]>
    ) => Promise<Awaited<ReturnType<Provider[K]>>>
} & { dispose?(): void }

export interface ProviderTransportOptions
    extends Pick<ClientEnv<any>, 'dynamicImportFromUri' | 'dynamicImportFromSource'> {
    authInfo?: AuthInfo
    cache?: boolean
    logger?: Logger
}

/**
 * Create a transport that communicates with a provider URI using the provider API.
 *
 * @internal
 */
export function createTransport(providerUri: string, options: ProviderTransportOptions): ProviderTransport {
    function doResolveProvider(providerUri: string): ProviderTransport {
        let url = new URL(providerUri)
        if (url.protocol === 'file:' || (runtimeSupportsImportFromUrl() && isRemoteJavaScriptFile(url))) {
            if (isHttpsPlusJs(url)) {
                url = removePlusJs(url)
            }
            return createLocalModuleFileTransport(url.toString(), options)
        }
        if (isRemoteJavaScriptFile(url)) {
            if (isHttpsPlusJs(url)) {
                url = removePlusJs(url)
            }
            return createRemoteModuleFileTransport(url.toString(), options)
        }
        if (isHttpOrHttps(url)) {
            return createHttpTransport(providerUri, options)
        }
        throw new Error(`Unsupported OpenCtx provider URI: ${providerUri}`)
    }

    let provider = doResolveProvider(providerUri)
    if (options.cache) {
        provider = cachedTransport(provider)
    }
    return provider
}

function isRemoteJavaScriptFile(url: URL): boolean {
    return (isHttpOrHttps(url) && hasJavaScriptExt(url.pathname)) || isHttpsPlusJs(url) || isWellKnownNpmUrl(url)
}

function isHttpOrHttps(url: URL): boolean {
    return url.protocol === 'http:' || url.protocol === 'https:'
}

function hasJavaScriptExt(path: string): boolean {
    return /\.[cm]?[jt]s$/.test(path)
}

function isHttpsPlusJs(url: URL): boolean {
    return url.protocol === 'http+js:' || url.protocol === 'https+js:'
}

function removePlusJs(url: URL): URL {
    return new URL(url.toString().replace(/^(https?)\+js:/, '$1:'))
}

/**
 * Matches the https://openctx.org/npm/* service.
 */
function isWellKnownNpmUrl(url: URL): boolean {
    return url.protocol === 'https:' && url.host === 'openctx.org' && url.pathname.startsWith('/npm/')
}

function runtimeSupportsImportFromUrl(): boolean {
    // `import('https://...')` is not supported natively in Node.js; see
    // https://nodejs.org/api/esm.html#urls.
    //
    // TODO(sqs): this is hacky and not correct in general
    //
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return typeof window !== 'undefined'
}
