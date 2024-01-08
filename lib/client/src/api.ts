import { type ItemsParams, type ItemsResult, type ProviderSettings } from '@openctx/protocol'
import { type Item as ItemWithPlainRange, type Range } from '@openctx/schema'
import {
    catchError,
    combineLatest,
    defer,
    from,
    map,
    mergeMap,
    of,
    startWith,
    tap,
    type Observable,
    type ObservableInput,
} from 'rxjs'
import { type ClientEnv } from './client/client'
import { type ProviderClient } from './providerClient/createProviderClient'

/**
 * An OpenCtx item.
 */
export interface Item<R extends Range = Range> extends Omit<ItemWithPlainRange, 'range'> {
    range?: R | undefined
}

/**
 * Like {@link ProviderClient}, but the provider methods return {@link Observable} values instead of
 * just {@link Promise} values. This makes it easier to test {@link observeItems}.
 */
export type ObservableProviderClient = {
    [M in keyof ProviderClient]: (
        ...args: Parameters<ProviderClient[M]>
    ) => ObservableInput<Awaited<ReturnType<ProviderClient[M]>>>
}

export interface ProviderClientWithSettings {
    providerClient: ObservableProviderClient | ProviderClient
    settings: ProviderSettings
}

/**
 * Observes OpenCtx items from the configured providers.
 */
export function observeItems<R extends Range>(
    providerClients: Observable<ProviderClientWithSettings[]>,
    params: ItemsParams,
    { emitPartial, logger, makeRange }: Pick<ClientEnv<R>, 'logger' | 'makeRange'> & { emitPartial?: boolean }
): Observable<Item<R>[]> {
    return providerClients.pipe(
        mergeMap(providerClients =>
            providerClients && providerClients.length > 0
                ? combineLatest(
                      providerClients.map(({ providerClient, settings }) =>
                          defer(() => from(providerClient.items(params, settings))).pipe(
                              emitPartial ? startWith(null) : tap(),
                              catchError(error => {
                                  logger?.(`failed to get items: ${error}`)
                                  console.error(error)
                                  return of(null)
                              })
                          )
                      )
                  )
                : of([])
        ),
        map(result => result.filter((v): v is ItemsResult => v !== null).flat()),
        map(items =>
            items
                .map(item => ({ ...item, range: item.range ? makeRange(item.range) : undefined }))
                .sort((a, b) => {
                    const lineCmp = (a.range?.start.line ?? 0) - (b.range?.start.line ?? 0)
                    if (lineCmp !== 0) {
                        return lineCmp
                    }
                    return (a.range?.start.character ?? 0) - (b.range?.start.character ?? 0)
                })
        ),
        tap(items => {
            if (LOG_VERBOSE) {
                logger?.(`got ${items.length} items: ${JSON.stringify(items)}`)
            }
        })
    )
}

const LOG_VERBOSE = true
