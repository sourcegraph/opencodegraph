import {
    type AnnotationsParams,
    type AnnotationsResult,
    type CapabilitiesParams,
    type CapabilitiesResult,
    type ProviderSettings,
} from '@openctx/protocol'

/**
 * An OpenCtx provider implemented in TypeScript/JavaScript.
 *
 * @template S The type of provider settings.
 */
export interface Provider<S extends {} = ProviderSettings> {
    /**
     * Reports the capabilities of the provider.
     *
     * TODO(sqs): fix this...right now capabilities needs to be sent each time right before
     * annotations anyway, so it probably should be like "annotations" and "resolveAnnotations" or
     * some optimization so the client doesnt need to always send over the full text.
     */
    capabilities(params: CapabilitiesParams, settings: S): CapabilitiesResult | Promise<CapabilitiesResult>

    /**
     * Returns OpenCtx annotations for the given file.
     */
    annotations(params: AnnotationsParams, settings: S): AnnotationsResult | Promise<AnnotationsResult>

    /**
     * Called when the provider will no longer be used. The provider should release its resources,
     * such as event listeners or background routines.
     */
    dispose?(): void
}
