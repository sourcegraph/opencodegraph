/**
 * Metadata about code
 */
export interface Data {
    annotations?: Annotation[]
}
/**
 * An annotation describes information relevant to a specific range in a file.
 */
export interface Annotation {
    item: Item
    range: Range
}
export interface Item {
    title: string
    detail?: string
    /**
     * An external URL with more information.
     */
    url?: string
    image?: ItemImage
}
export interface ItemImage {
    url: string
    width?: number
    height?: number
    alt?: string
}
export interface Range {
    start: Position
    end: Position
}
export interface Position {
    line: number
    character: number
}
