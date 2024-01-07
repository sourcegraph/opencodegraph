/**
 * A hint about how to best present an annotation to the human in the client's user interface.
 *
 * - `group-at-top-of-file`: Group all annotations with the same `ui.group` value together and display them at the top of the file instead of at their given file range.
 * - `prefer-link-over-detail`: Prefer to show the annotation as a link over showing the detail text, if the client does not cleanly support doing both.
 */
export type PresentationHint = 'group-at-top-of-file' | 'prefer-link-over-detail'

/**
 * Metadata about code
 */
export interface Schema {
    annotations?: Annotation[]
}
/**
 * An annotation describes information relevant to a file (or a range within a file).
 */
export interface Annotation {
    /**
     * A descriptive title of the annotation.
     */
    title: string
    /**
     * An external URL with more information about the annotation.
     */
    url?: string
    ui?: UserInterface
    ai?: AssistantInfo
    range?: Range
}
/**
 * The human user interface of the annotation, with information for human consumption.
 */
export interface UserInterface {
    /**
     * Text containing additional details for the human, shown when they interact with the annotation.
     */
    detail?: string
    /**
     * The format of the title and description (Markdown or plain text).
     */
    format?: 'markdown' | 'plaintext'
    /**
     * If set, this annotation is grouped together with all other annotations with the same `group` value.
     */
    group?: string
    /**
     * Hints about the best way to present this annotation. Different clients interpret hints differently because they have different user interfaces.
     */
    presentationHints?: PresentationHint[]
}
/**
 * Information from the annotation intended for consumption by AI, not humans.
 */
export interface AssistantInfo {
    /**
     * Text content for AI to consume.
     */
    content?: string
}
/**
 * The range in the file that this annotation applies to. If not set, the annotation applies to the entire file.
 */
export interface Range {
    start: Position
    end: Position
}
export interface Position {
    line: number
    character: number
}
