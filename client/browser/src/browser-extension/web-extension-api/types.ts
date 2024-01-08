import { type Client, type Range } from '@openctx/client'

/**
 * Wrapper type for a string of JSONC (JSON with comments and trailing commas).
 *
 * A wrapper type is used to reduce the likelihood that it is accidentally parsed as (less-tolerant)
 * JSON.
 */
interface JSONCString {
    jsonc: string
}

export interface LocalStorageItems {}

export interface SyncStorageItems {
    configuration: JSONCString
}

export interface ManagedStorageItems {}

/**
 * Functions in the background page that can be invoked from content scripts.
 */
export interface BackgroundApi extends Pick<Client<Range>, 'itemsChanges'> {}

/**
 * Shape of the handler object in the background worker.
 * The handlers get access to the sender tab of the message as a parameter.
 */
export type BackgroundApiHandlers = {
    [M in keyof BackgroundApi]: (
        args: Parameters<BackgroundApi[M]>,
        sender: browser.runtime.MessageSender
    ) => ReturnType<BackgroundApi[M]>
}
