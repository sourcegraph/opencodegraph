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
    title?: string
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
}
/**
 * Information from the annotation intended for consumption by AI, not humans.222
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
