import { Facet, type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { type Item } from '@openctx/client'
import { openCtxWidgets } from './blockWidget'

export interface OpenCtxDecorationsConfig {
    createDecoration: (
        container: HTMLElement,
        spec: {
            /**
             * The leading whitespace on the line of code that the items are attached to.
             */
            indent: string | undefined

            items: Item[]
        }
    ) => { destroy?: () => void }

    visibility: boolean
}

/**
 * Show OpenCtx decorations.
 */
export function showOpenCtxDecorations(config: OpenCtxDecorationsConfig): Extension {
    return [openCtxWidgets(config), baseTheme]
}

/**
 * Provide OpenCtx data.
 */
export function openCtxData(data: Item[] | undefined): Extension {
    return data ? openCtxDataFacet.of(data) : []
}

/**
 * Facet for OpenCtx data.
 */
export const openCtxDataFacet = Facet.define<Item[], Item[]>({
    combine(values) {
        return values.flat()
    },
})

/**
 * Theme for OpenCtx decorations.
 */
export const baseTheme = EditorView.baseTheme({
    '.octx-chip': {
        fontSize: '88%',
        fontFamily: 'system-ui, sans-serif',
    },
    '&dark .octx-chip': {
        background: '#00000066',
        border: 'solid 1px #ffffff22',
        color: 'white',
        '&:hover': {
            backgroundColor: '#000000',
        },
    },
    '&light .octx-chip': {
        background: '#00000011',
        border: 'solid 1px #00000011',
        color: 'black',
        '&:hover': {
            backgroundColor: '#00000022',
        },
    },
    '.octx-chip-popover': {
        backgroundColor: '#000000',
        color: 'white',
        border: 'solid 1px #ffffff22',
        whiteSpace: 'normal',
    },

    // Move line number down to the line with code, not the line with the items.
    '.cm-lineNumbers': {
        '& .cm-gutterElement': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
        },
    },
})
