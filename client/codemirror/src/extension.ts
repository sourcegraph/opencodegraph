import { Facet, type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { type Annotation } from '@opencodegraph/client'
import { openCodeGraphWidgets } from './itemBlockWidget'

export interface OpenCodeGraphDecorationsConfig {
    createDecoration: (
        container: HTMLElement,
        spec: {
            /**
             * The leading whitespace on the line of code that the items are attached to.
             */
            indent: string | undefined

            annotations: Annotation[]
        }
    ) => { destroy?: () => void }

    visibility: boolean
}

/**
 * Show OpenCodeGraph decorations.
 */
export function showOpenCodeGraphDecorations(config: OpenCodeGraphDecorationsConfig): Extension {
    return [openCodeGraphWidgets(config), baseTheme]
}

/**
 * Provide OpenCodeGraph data.
 */
export function openCodeGraphData(data: Annotation[] | undefined): Extension {
    return data ? openCodeGraphDataFacet.of(data) : []
}

/**
 * Facet for OpenCodeGraph data.
 */
export const openCodeGraphDataFacet = Facet.define<Annotation[], Annotation[]>({
    combine(values) {
        return values.flat()
    },
})

/**
 * Theme for OpenCodeGraph decorations.
 */
export const baseTheme = EditorView.baseTheme({
    '.ocg-chip': {
        fontSize: '88%',
        fontFamily: 'system-ui, sans-serif',
    },
    '&dark .ocg-chip': {
        background: '#00000066',
        border: 'solid 1px #ffffff22',
        color: 'white',
        '&:hover': {
            backgroundColor: '#000000',
        },
    },
    '&light .ocg-chip': {
        background: '#00000011',
        border: 'solid 1px #00000011',
        color: 'black',
        '&:hover': {
            backgroundColor: '#00000022',
        },
    },
    [hackRootCssSelector('.ocg-chip-popover')]: {
        backgroundColor: '#000000',
        color: 'white',
        border: 'solid 1px #ffffff22',
        whiteSpace: 'normal',
    },

    // Move line number down to the line with code, not the line with the annotations.
    '.cm-lineNumbers': {
        '& .cm-gutterElement': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
        },
    },
})

function hackRootCssSelector(cssSelector: string): string {
    // CodeMirror tries to namespace all selectors, but this hacks around it by tricking it so that
    // we can define a root CSS rule. This is necessary because the ItemChip popover is rendered in
    // a portal, which is not in the CodeMirror editor's DOM tree.
    return `.a{} ${cssSelector}`
}
