import type * as vscode from 'vscode'
import { URI } from 'vscode-uri'

export function mockTextDocument(uri = 'file:///a.txt'): vscode.TextDocument {
    return {
        uri: URI.parse(uri),
        languageId: 'plaintext',
        getText: () => 'test',
    } as vscode.TextDocument
}

export const noopCancellationToken: vscode.CancellationToken = null as any

export function createPosition(line: number, character: number): vscode.Position {
    return {
        line,
        character,
    } as vscode.Position
}

export function createRange(
    startLine: number,
    startCharacter: number,
    endLine: number,
    endCharacter: number
): vscode.Range {
    return {
        start: {
            line: startLine,
            character: startCharacter,
        },
        end: {
            line: endLine,
            character: endCharacter,
        },
    } as vscode.Range
}
