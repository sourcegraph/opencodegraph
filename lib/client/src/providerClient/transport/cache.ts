import type { ItemsResult, CapabilitiesResult } from '@openctx/protocol'
import { LRUCache } from 'lru-cache'
import type { ProviderTransport } from './createTransport'

export function cachedTransport(provider: ProviderTransport): ProviderTransport {
    const cache = new LRUCache<string, CapabilitiesResult | ItemsResult>({
        max: 20,
        ttl: 1000 * 60 * 5, // 5 minutes
    })
    function cachedMethodCall<M extends Exclude<keyof ProviderTransport, 'dispose'>>(
        method: M,
        args: Parameters<ProviderTransport[M]>,
        fn: (...args: Parameters<ProviderTransport[M]>) => Promise<Awaited<ReturnType<ProviderTransport[M]>>>
    ): Promise<Awaited<ReturnType<ProviderTransport[M]>>> {
        const fullKey = `${method}:${JSON.stringify(args)}`
        const entry = cache.get(fullKey) as Awaited<ReturnType<ProviderTransport[M]>> | undefined
        if (entry) {
            return Promise.resolve(entry)
        }

        return Promise.resolve(fn(...args)).then(result => {
            cache.set(fullKey, result)
            return result
        })
    }
    return {
        capabilities: (...args) =>
            cachedMethodCall('capabilities', args, (params, settings) => provider.capabilities(params, settings)),
        items: (...args) =>
            cachedMethodCall('items', args, (params, settings) => provider.items(params, settings)),
        dispose: () => {
            cache.clear()
            provider.dispose?.()
        },
    }
}
