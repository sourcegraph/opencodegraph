import { type ItemsParams, type ItemsResult, type ProviderSettings } from '@openctx/protocol'
import { scopedLogger } from '../logger'
import { matchSelectors } from './selector'
import { createTransport, type ProviderTransportOptions } from './transport/createTransport'

/**
 * A {@link ProviderClient} communicates with a single OpenCtx provider. It is stateless and
 * wraps a {@link ProviderTransport}.
 */
export interface ProviderClient {
    /**
     * Get items from the provider, respecting the provider's capabilities. For example, if
     * the document is not matched by the provider's selectors, then no items will be
     * returned.
     */
    items(params: ItemsParams, settings: ProviderSettings): Promise<ItemsResult | null>
}

export interface ProviderClientOptions
    extends Pick<
        ProviderTransportOptions,
        'authInfo' | 'logger' | 'dynamicImportFromUri' | 'dynamicImportFromSource'
    > {}

/**
 * Create a new {@link ProviderClient}.
 */
export function createProviderClient(
    providerUri: string,
    { logger, ...options }: ProviderClientOptions = {}
): ProviderClient {
    logger = scopedLogger(logger, `providerClient(${providerUri})`)

    const transport = createTransport(providerUri, { ...options, cache: true, logger })

    return {
        async items(params: ItemsParams, settings: ProviderSettings): Promise<ItemsResult | null> {
            let match: (params: ItemsParams) => boolean | undefined
            try {
                logger?.('checking provider capabilities')
                const capabilities = await transport.capabilities({}, settings)
                logger?.(`received capabilities = ${JSON.stringify(capabilities)}`)
                match = matchSelectors(capabilities.selector)
            } catch (error) {
                logger?.(`failed to get provider capabilities: ${error}`)
                return Promise.reject(error)
            }

            const capable = match(params)
            if (!capable) {
                logger?.(
                    `skipping items for ${JSON.stringify(
                        params.file
                    )} because it did not match the provider's selector`
                )
                return null
            }
            try {
                return await transport.items(params, settings)
            } catch (error) {
                logger?.(`failed to get items: ${error}`)
                return Promise.reject(error)
            }
        },
    }
}
