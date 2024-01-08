import { AnnotatedEditor, SettingsEditor } from '@openctx/web-playground'
import clsx from 'clsx'
import { useCallback, useState, type FunctionComponent } from 'react'
import { ClientOnlySync } from '../../src/components/ClientOnlySync.tsx'
import { DEFAULT_CODEMIRROR_PROPS } from '../../src/components/codemirror/defaults.ts'
import { INITIAL_FILE, INITIAL_SETTINGS } from './data.ts'
import { Preload } from './Preload.tsx'

const CODEMIRROR_PROPS: React.ComponentProps<typeof SettingsEditor>['codeMirrorProps'] = {
    ...DEFAULT_CODEMIRROR_PROPS,
    height: '100%',
    className: 'flex-1 overflow-hidden border border-[hsla(276,50%,27%,1)]',
}

const _Playground: FunctionComponent<{ className?: string }> = ({ className }) => {
    const [settings, setSettings] = useState<string>(INITIAL_SETTINGS)

    const [fileContent, setFileContent] = useState<string>(INITIAL_FILE.fileContent)

    return (
        <div
            className={clsx(
                'mx-auto flex max-w-screen-lg flex-col gap-5 xl:max-w-screen-2xl xl:flex-row-reverse xl:gap-0',
                className
            )}
        >
            <AnnotatedEditor
                fileUri={INITIAL_FILE.fileUri}
                value={fileContent}
                onChange={setFileContent}
                settings={settings}
                simple={false}
                className="flex min-h-[400px] w-full flex-col xl:ml-[-1px] xl:w-1/2"
                codeMirrorProps={CODEMIRROR_PROPS}
                headerTitleClassName="font-bold"
                headerValidClassName="px-1 text-muted-foreground text-xs"
                headerInvalidClassName="px-1 bg-destructive text-destructive-foreground text-xs"
            />
            <SettingsEditor
                value={settings}
                onChange={setSettings}
                className="flex min-h-[400px] w-full flex-col xl:w-1/2"
                codeMirrorProps={CODEMIRROR_PROPS}
                headerTitleClassName="font-bold"
                headerValidClassName="px-1 text-muted-foreground text-xs"
                headerInvalidClassName="px-1 bg-destructive text-destructive-foreground text-xs"
            />
            <Preload />
        </div>
    )
}

export const Playground: typeof _Playground = props => (
    <ClientOnlySync
        component={useCallback(
            () => (
                <_Playground {...props} />
            ),
            [props]
        )}
        initial={<div className="mt-64 text-center text-sm font-bold text-muted-foreground">Loading...</div>}
    />
)
