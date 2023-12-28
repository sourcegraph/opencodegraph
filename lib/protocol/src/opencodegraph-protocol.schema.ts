import { Annotation } from '@opencodegraph/schema'

/**
 * OpenCodeGraph client/provider protocol
 */
export type Protocol =
    | RequestMessage
    | ResponseMessage
    | ResponseError
    | ProviderSettings
    | CapabilitiesParams
    | CapabilitiesResult
    | AnnotationsParams
    | AnnotationsResult
export type AnnotationsResult = Annotation[]

export interface RequestMessage {
    method: string
    params?: unknown
    settings?: ProviderSettings
}
/**
 * User settings sent by the client to the provider.
 */
export interface ProviderSettings {
    [k: string]: unknown | undefined
}
export interface ResponseMessage {
    result?: unknown
    error?: ResponseError
}
export interface ResponseError {
    code: number
    message: string
    data?: unknown
}
export interface CapabilitiesParams {}
export interface CapabilitiesResult {
    /**
     * Selects the scope (repositories, files, and languages) in which this provider should be called.
     *
     * At least 1 must be satisfied for the provider to be called. If empty, the provider is never called. If undefined, the provider is called on all files.
     */
    selector?: Selector[]
}
/**
 * Defines a scope in which a provider is called, as a subset of languages, repositories, and/or files.
 *
 * To satisfy a selector, all of the selector's conditions must be met. For example, if both `path` and `content` are specified, the file must satisfy both conditions.
 */
export interface Selector {
    /**
     * A glob that must match the file path. If the file's location is represented as a URI, the URI's scheme is stripped before being matched against this glob.
     *
     * Use `** /` before the glob to match in any parent directory. Use `/**` after the glob to match any files under a directory. Leading slashes are stripped from the path before being matched against the glob.
     */
    path?: string
    /**
     * A literal string that must be present in the file's content.
     */
    contentContains?: string
}
export interface AnnotationsParams {
    /**
     * The file's URI.
     */
    file: string
    /**
     * The file's content.
     */
    content: string
}
