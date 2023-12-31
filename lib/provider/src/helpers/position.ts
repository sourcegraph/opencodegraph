import { Position } from '@opencodegraph/schema'

export type PositionCalculator = (offset: number) => Position

/**
 * Create a {@link PositionCalculator} for a file that can be used to compute the position (line and
 * character) of a given character offset in the file.
 */
export function createFilePositionCalculator(content: string): PositionCalculator {
    const lines = content.split('\n')
    return (offset: number) => {
        let line = 0
        let character = 0
        while (line < lines.length && offset > 0) {
            const lineLength = lines[line].length + 1 // +1 for the newline
            if (lineLength > offset) {
                character = offset
                break
            }
            offset -= lineLength
            line += 1
        }
        return { line, character }
    }
}
