import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const cursor = 'hsla(276, 72%, 75%, 1)'

export const octxDarkTheme = EditorView.theme(
    {
        '&': {
            color: 'hsla(0, 0%, 100%, 0.8)',
            backgroundColor: 'hsl(276 72% 9%)',
        },

        '.cm-content': {
            caretColor: cursor,
        },

        '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursor },
        '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
            { backgroundColor: 'hsla(276, 72%, 25%, 1)' },

        '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'hsla(276, 72%, 50%, 0.2)' },

        '.cm-gutters': {
            backgroundColor: 'hsla(0, 0%, 0%, 0.5)',
            color: 'hsla(0, 0%, 100%, 0.35)',
            border: 'none',
        },
    },
    { dark: true }
)

const chalky = 'hsl(225, 72%, 70%)'
const coral = 'hsl(276, 72%, 85%)'
const cyan = '#56b6c2'
const invalid = '#ffffff'
const stone = '#7d8799'
const malibu = '#61afef'
const sage = 'hsl(200, 72%, 50%)'
const whiskey = '#d19a66'
const violet = '#c678dd'

export const octxHighlightStyle = syntaxHighlighting(
    HighlightStyle.define([
        { tag: t.keyword, color: violet },
        { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: coral },
        { tag: [t.function(t.variableName), t.labelName], color: malibu },
        { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: whiskey },
        { tag: [t.definition(t.name), t.separator], color: 'hsl(0 0% 83%)' },
        {
            tag: [t.typeName, t.className, t.number, t.changed, t.item, t.modifier, t.self, t.namespace],
            color: chalky,
        },
        { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: cyan },
        { tag: [t.meta, t.comment], color: stone },
        { tag: t.strong, fontWeight: 'bold' },
        { tag: t.emphasis, fontStyle: 'italic' },
        { tag: t.strikethrough, textDecoration: 'line-through' },
        { tag: t.link, color: stone, textDecoration: 'underline' },
        { tag: t.heading, fontWeight: 'bold', color: coral },
        { tag: [t.atom, t.bool, t.special(t.variableName)], color: whiskey },
        { tag: [t.processingInstruction, t.string, t.inserted], color: sage },
        { tag: t.invalid, color: invalid },
    ])
)

export const octxTheme: Extension = [octxDarkTheme, octxHighlightStyle]
