import { EditorView } from '@codemirror/view'
import { type SettingsEditor } from '@openctx/web-playground'
import { octxDarkTheme, octxHighlightStyle } from './colorTheme.ts'

const makeChipTextSmaller = EditorView.theme({
    '.octx-chip': {
        fontSize: '78%',
    },
})

export const DEFAULT_CODEMIRROR_PROPS: React.ComponentProps<typeof SettingsEditor>['codeMirrorProps'] = {
    extensions: [octxHighlightStyle, makeChipTextSmaller],
    theme: octxDarkTheme,
    style: { fontSize: '90%' },
}
