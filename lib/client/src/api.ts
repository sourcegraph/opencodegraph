import { type AnnotationsParams, type AnnotationsResult, type ProviderSettings } from '@opencodegraph/protocol'
import { type Annotation as AnnotationWithPlainRange, type Range } from '@opencodegraph/schema'
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
export interface Annotation<R extends Range = Range> extends Omit<AnnotationWithPlainRange, 'range'> {
    range?: R | undefined
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
                                  console.error(error)
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
                .map(ann => ({ ...ann, range: ann.range ? makeRange(ann.range) : undefined }))
                .sort((a, b) => {
                    const lineCmp = (a.range?.start.line ?? 0) - (b.range?.start.line ?? 0)
                    if (lineCmp !== 0) {
                        return lineCmp
                    }
                    return (a.range?.start.character ?? 0) - (b.range?.start.character ?? 0)
                })
        ),
        tap(anns => {
            if (LOG_ANNOTATIONS) {
                logger?.(`got ${anns.length} annotations: ${JSON.stringify(anns)}`)
            }
        })
    )
}

const LOG_ANNOTATIONS = true
