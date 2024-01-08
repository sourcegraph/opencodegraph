import { type AnnotationsParams, type ProviderSettings } from '@openctx/protocol'
import { type Provider } from '@openctx/provider'
import { type Range } from '@openctx/schema'
import { LRUCache } from 'lru-cache'
import {
    catchError,
    combineLatest,
    distinctUntilChanged,
    firstValueFrom,
    from,
    map,
    mergeMap,
    of,
    shareReplay,
    type Observable,
    type ObservableInput,
    type Unsubscribable,
} from 'rxjs'
import { observeAnnotations, type Annotation, type ObservableProviderClient } from '../api'
import { configurationFromUserInput, type Configuration, type ConfigurationUserInput } from '../configuration'
import { type Logger } from '../logger'
import { createProviderClient, type ProviderClient } from '../providerClient/createProviderClient'

/**
 * Hooks for the OpenCtx {@link Client} to access information about the environment, such as
 * the user's configuration and authentication info.
 *
 * @template R The type to use for ranges (such as `vscode.Range` for VS Code extensions).
 */
export interface ClientEnv<R extends Range> {
    /**
     * The configuration (set by the user in the client application) that applies to a file,
     * typically the file that is being annotated with OpenCtx information.
     *
     * The configuration depends on the current file because some editors support per-file
     * configuration, such as VS Code: global user settings, workspace settings, workspace folder
     * settings, language-specific settings, etc.
     *
     * @param file URI of the active file, or `undefined` if there is no active file.
     */
    configuration(file?: string): ObservableInput<ConfigurationUserInput>

    /**
     * The authentication info for the provider.
     *
     * @param provider The provider URI.
     */
    authInfo?(provider: string): ObservableInput<AuthInfo | null>

    /**
     * Called to print a log message.
     */
    logger?: Logger

    /**
     * Make a "rich" range from a plain range.
     *
     * @param range A plain range.
     * @returns A "rich" range (such as `vscode.Range`).
     */
    makeRange: (range: Range) => R

    /**
     * Called (if set) to dynamically import an OpenCtx provider from a URI. This can be used
     * by runtimes that need to pre-bundle providers.
     */
    dynamicImportFromUri?: (uri: string) => Promise<{ default: Provider }>

    /**
     * Called (if set) to dynamically import an OpenCtx provider from its ES module source
     * code. This can be used by runtimes that only support `require()` and CommonJS (such as VS
     * Code).
     */
    dynamicImportFromSource?: (uri: string, esmSource: string) => Promise<{ exports: { default: Provider } }>

    /**
     * @internal
     */
    __mock__?: ClientMocks
}

/**
 * Authentication info for a provider, returned by {@link ClientEnv.authInfo}.
 */
export interface AuthInfo {
    /**
     * HTTP headers for authentication to be included on all HTTP requests to the provider.
     */
    headers?: { [name: string]: string }
}

/**
 * An OpenCtx client, used by client applications (such as editors, code browsers, etc.) to
 * manage OpenCtx providers and annotations.
 *
 * @template R The type to use for ranges (such as `vscode.Range` for VS Code extensions).
 */
export interface Client<R extends Range> {
    /**
     * Get the annotations returned by the configured providers for the given file.
     *
     * It is called `firstAnnotations` because it only returns the first annotations returned by
     * each provider. It does not continue to listen for changes, as
     * {@link Client.annotationsChanges} does. Using {@link Client.annotations} is simpler and
     * does not require use of observables (with a library like RxJS), but it means that the client
     * needs to manually poll for updated annotations if freshness is important.
     */
    annotations(params: AnnotationsParams): Promise<Annotation<R>[]>

    /**
     * Observe OpenCtx annotations from the configured providers for the given file.
     *
     * The returned observable streams annotations as they are received from the providers and
     * continues passing along any updates until unsubscribed.
     */
    annotationsChanges(
        params: AnnotationsParams,
        options?: {
            /**
             * Emit partial results immediately. If `false`, wait for all providers to return an initial
             * result before emitting. If the caller is consuming the result as a Promise (with only one
             * value), this should be `false`.
             *
             * @default true
             */
            emitPartial?: boolean
        }
    ): Observable<Annotation<R>[]>

    /**
     * Dispose of the client and release all resources.
     */
    dispose(): void
}

/**
 * Create a new OpenCtx client.
 *
 * @template R The type to use for ranges (such as `vscode.Range` for VS Code extensions).
 */
export function createClient<R extends Range>(env: ClientEnv<R>): Client<R> {
    const subscriptions: Unsubscribable[] = []

    const providerCache = createProviderPool()

    // Enable/disable logger based on the `debug` config.
    const debug = from(env.configuration()).pipe(
        map(config => configurationFromUserInput(config).debug),
        distinctUntilChanged(),
        shareReplay(1)
    )
    subscriptions.push(debug.subscribe())
    const logger: Logger = message => {
        firstValueFrom(debug)
            .then(debug => {
                if (debug) {
                    env.logger?.(message)
                }
            })
            .catch(() => {})
    }

    const annotationsChanges: Client<R>['annotationsChanges'] = (
        params: AnnotationsParams,
        { emitPartial = true } = { emitPartial: true }
    ): Observable<Annotation<R>[]> => {
        const configuration: Observable<Configuration> = from(env.configuration(params.file)).pipe(
            map(config => {
                if (!config.enable) {
                    config = { ...config, providers: {} }
                }
                return configurationFromUserInput(config)
            })
        )

        interface ProviderClientWithSettings {
            providerClient: ObservableProviderClient
            settings: ProviderSettings
        }
        const providerClientsWithSettings: Observable<ProviderClientWithSettings[]> = configuration.pipe(
            mergeMap(configuration =>
                configuration.providers.length > 0
                    ? combineLatest(
                          configuration.providers.map(({ providerUri, settings }) =>
                              (env.authInfo ? from(env.authInfo(providerUri)) : of(null)).pipe(
                                  map(authInfo => ({
                                      providerClient: env.__mock__?.getProviderClient
                                          ? env.__mock__.getProviderClient()
                                          : providerCache.getOrCreate(
                                                { providerUri, authInfo: authInfo ?? undefined },
                                                {
                                                    logger,
                                                    dynamicImportFromUri: env.dynamicImportFromUri,
                                                    dynamicImportFromSource: env.dynamicImportFromSource,
                                                }
                                            ),
                                      settings,
                                  })),
                                  catchError(error => {
                                      logger(`Error creating provider client for ${providerUri}: ${error}`)
                                      return of(null)
                                  })
                              )
                          )
                      )
                    : of([])
            ),

            // Filter out null clients.
            map(providerClients =>
                providerClients.filter(
                    (providerClient): providerClient is ProviderClientWithSettings => providerClient !== null
                )
            )
        )

        return observeAnnotations(providerClientsWithSettings, params, {
            logger: env.logger,
            makeRange: env.makeRange,
            emitPartial,
        })
    }

    return {
        annotations(params) {
            return firstValueFrom(annotationsChanges(params, { emitPartial: false }))
        },
        annotationsChanges,
        dispose() {
            for (const sub of subscriptions) {
                sub.unsubscribe()
            }
        },
    }
}

interface ProviderCacheKey {
    providerUri: string
    authInfo: AuthInfo | undefined
}

function createProviderPool(): {
    getOrCreate: (
        key: ProviderCacheKey,
        env: Pick<ClientEnv<any>, 'logger' | 'dynamicImportFromUri' | 'dynamicImportFromSource'>
    ) => ProviderClient
} {
    function cacheKey(key: ProviderCacheKey): string {
        return JSON.stringify(key)
    }

    const cache = new LRUCache<string, ProviderClient>({
        ttl: 1000 * 60 * 5 /* 5 minutes */,
        ttlResolution: 1000,
        ttlAutopurge: true,
    })

    return {
        getOrCreate(key, env) {
            const existing = cache.get(cacheKey(key))
            if (existing) {
                return existing
            }

            const c = createProviderClient(key.providerUri, {
                authInfo: key.authInfo,
                logger: env.logger,
                dynamicImportFromUri: env.dynamicImportFromUri,
                dynamicImportFromSource: env.dynamicImportFromSource,
            })
            cache.set(cacheKey(key), c)
            return c
        },
    }
}

/**
 * For use in tests only.
 *
 * @internal
 */
interface ClientMocks {
    getProviderClient: () => ObservableProviderClient
}
