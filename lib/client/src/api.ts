import { type AnnotationsParams, type AnnotationsResult, type ProviderSettings } from '@opencodegraph/protocol'
import { type Item, type Range } from '@opencodegraph/schema'
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
 * An OpenCodeGraph annotation.
 */
export interface Annotation<R extends Range = Range> {
    item: Item
    range: R
}

/**
 * Like {@link ProviderClient}, but the provider methods return {@link Observable} values instead of
 * just {@link Promise} values. This makes it easier to test {@link observeAnnotations}.
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
 * Observes OpenCodeGraph annotations from the configured providers.
 */
export function observeAnnotations<R extends Range>(
    providerClients: Observable<ProviderClientWithSettings[]>,
    params: AnnotationsParams,
    { emitPartial, logger, makeRange }: Pick<ClientEnv<R>, 'logger' | 'makeRange'> & { emitPartial?: boolean }
): Observable<Annotation<R>[]> {
    return providerClients.pipe(
        mergeMap(providerClients =>
            providerClients && providerClients.length > 0
                ? combineLatest(
                      providerClients.map(({ providerClient, settings }) =>
                          defer(() => from(providerClient.annotations(params, settings))).pipe(
                              emitPartial ? startWith(null) : tap(),
                              catchError(error => {
                                  logger?.(`failed to get annotations: ${error}`)
                                  return of(null)
                              })
                          )
                      )
                  )
                : of([])
        ),
        map(result => result.filter((v): v is AnnotationsResult => v !== null).flat()),
        map(anns =>
            anns
                .map(ann => ({ ...ann, range: makeRange(ann.range) }))
                .sort((a, b) => {
                    if (a.range.start.line < b.range.start.line) {
                        return -1
                    }
                    if (a.range.start.line > b.range.start.line) {
                        return 1
                    }
                    if (a.range.start.character < b.range.start.character) {
                        return -1
                    }
                    if (a.range.start.character > b.range.start.character) {
                        return 1
                    }
                    return 0
                })
        )
    )
}
