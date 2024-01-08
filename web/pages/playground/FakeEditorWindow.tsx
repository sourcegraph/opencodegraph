import { AnnotatedEditor as _AnnotatedEditor } from '@openctx/web-playground'
import clsx from 'clsx'
import { ArrowRightIcon, FileCodeIcon } from 'lucide-react'
import { useCallback, type FunctionComponent } from 'react'
import { ClientOnlySync } from '../../src/components/ClientOnlySync.tsx'
import { DEFAULT_CODEMIRROR_PROPS } from '../../src/components/codemirror/defaults.ts'
import { Link } from '../../src/components/Link.tsx'
import { INITIAL_FILE, INITIAL_SETTINGS } from './data.ts'
import styles from './FakeEditorWindow.module.css'
import { Preload } from './Preload.tsx'

const CODEMIRROR_PROPS = {
    ...DEFAULT_CODEMIRROR_PROPS,

    // Disable most features for simplicity.
    readOnly: true,
    basicSetup: {
        lineNumbers: true,
        highlightActiveLineGutter: true,
        highlightSpecialChars: false,
        history: false,
        foldGutter: false,
        drawSelection: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: false,
        syntaxHighlighting: false,
        bracketMatching: false,
        closeBrackets: false,
        autocompletion: false,
        rectangularSelection: false,
        crosshairCursor: false,
        highlightActiveLine: false,
        highlightSelectionMatches: false,
        closeBracketsKeymap: false,
        defaultKeymap: false,
        searchKeymap: false,
        historyKeymap: false,
        foldKeymap: false,
        completionKeymap: false,
        lintKeymap: false,
    },
}

export const FakeEditorWindow: FunctionComponent<{ className?: string }> = ({ className }) => (
    <div
        className={clsx(
            'min-h-[622px] rounded-lg border border-[hsla(276,50%,27%,1)] shadow-2xl shadow-muted',
            styles.container,
            className
        )}
    >
        <header className="flex flex-wrap justify-between gap-4 rounded-t-lg border-b border-[hsla(276,50%,27%,0.7)] bg-[hsla(276,72%,6%,1)] p-2 text-sm">
            <span className="flex items-start gap-2 font-mono font-semibold leading-tight text-white">
                <FileCodeIcon size={16} /> {INITIAL_FILE.fileUri.replace(/^.*\//, '')}
            </span>
            <Link href="/playground" className="flex items-center gap-1 pr-2 text-gray-400">
                Try in playground <ArrowRightIcon size={16} />
            </Link>
        </header>
        <div className="overflow-hidden rounded-b-lg">
            <AnnotatedEditor
                fileUri={INITIAL_FILE.fileUri}
                value={INITIAL_FILE.fileContent}
                onChange={noop}
                settings={INITIAL_SETTINGS}
                simple={true}
                codeMirrorProps={CODEMIRROR_PROPS}
            />
        </div>
        <Preload />
    </div>
)

const noop = (): void => {}

const AnnotatedEditor: typeof _AnnotatedEditor = props => (
    <ClientOnlySync
        component={useCallback(
            () => (
                <_AnnotatedEditor {...props} />
            ),
            [props]
        )}
        initial={<div className="p-3" />}
    />
)
