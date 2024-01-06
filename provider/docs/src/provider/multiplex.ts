import { type Provider } from '@opencodegraph/provider'
import { LRUCache } from 'lru-cache'

/**
 * @template S The settings type.
 */
export function multiplex<S extends {}>(createProvider: (settings: S) => Promise<Provider<S>>): Provider<S> {
    const providerCache = new LRUCache<string, Promise<Provider<S>>>({ max: 10 })

    function getProvider(settings: S): Promise<Provider<S>> {
        const key = JSON.stringify(settings)
        let provider = providerCache.get(key)
        if (!provider) {
            provider = createProvider(settings)
            providerCache.set(key, provider)
        }
        return provider
    }

    return {
        capabilities: (params, settings) => getProvider(settings).then(p => p.capabilities(params, settings)),
        annotations: (params, settings) => getProvider(settings).then(p => p.annotations(params, settings)),
    }
}
