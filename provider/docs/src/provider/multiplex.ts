import { type Provider } from '@opencodegraph/provider'

/**
 * @template S The settings type.
 */
export function multiplex<S extends {}>(createProvider: (settings: S) => Promise<Provider<S>>): Provider<S> {
    const providerCache = new Map<string, Promise<Provider<S>>>()

    function getProvider(settings: S): Promise<Provider<S>> {
        const key = JSON.stringify(settings)
        let provider = providerCache.get(key)
        if (!provider) {
            provider = createProvider(settings)
            providerCache.set(key, provider)

            // Prevent accidental memory leaks in case `settings` keeps changing.
            //
            // TODO(sqs): use an LRU cache or something
            const MAX_SIZE = 10
            if (providerCache.size > MAX_SIZE) {
                throw new Error(`provider cache is too big (max size ${MAX_SIZE})`)
            }
        }
        return provider
    }

    return {
        capabilities: (params, settings) => getProvider(settings).then(p => p.capabilities(params, settings)),
        annotations: (params, settings) => getProvider(settings).then(p => p.annotations(params, settings)),
    }
}
