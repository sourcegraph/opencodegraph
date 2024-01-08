import { proxyBackgroundMethodReturningObservable } from './rpc'
import type { BackgroundApi } from './types'

/**
 * Functions invoked from content scripts that will be executed in the background service worker.
 */
export const background: BackgroundApi = {
    itemsChanges: proxyBackgroundMethodReturningObservable('itemsChanges'),
}
