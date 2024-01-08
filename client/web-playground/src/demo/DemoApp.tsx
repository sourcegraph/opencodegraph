import { useEffect, useState, type FunctionComponent } from 'react'
import { AnnotatedEditor } from '../AnnotatedEditor'
import { SettingsEditor } from '../SettingsEditor'
import styles from './DemoApp.module.css'
import { getDefaultSettings } from './settings'

const SAMPLE_FILES = [
    'github.com/sourcegraph/sourcegraph@1f857814717cf5afdb128eb005df93df5b81cc2a/client/web/src/auth/SignInPage.story.tsx',
    'github.com/sourcegraph/sourcegraph@1f857814717cf5afdb128eb005df93df5b81cc2a/client/web/src/auth/SignInPage.tsx',
    'github.com/sourcegraph/sourcegraph@1f857814717cf5afdb128eb005df93df5b81cc2a/internal/repos/github.go',
    'github.com/sourcegraph/sourcegraph@1f857814717cf5afdb128eb005df93df5b81cc2a/internal/licensing/telemetryexport.go',
    'github.com/sourcegraph/sourcegraph@1f857814717cf5afdb128eb005df93df5b81cc2a/client/BUILD.bazel',
]

export const DemoApp: FunctionComponent = () => {
    const [settings, setSettings] = useState<string>()

    useEffect(() => {
        getDefaultSettings().then(setSettings).catch(console.error)
    }, [])

    const fileId = window.location.search?.replace(/^\?/, '') || DEFAULT_FILE_ID
    const [fileContent, setFileContent] = useState<string>()
    useEffect(() => {
        fetchFileContent(fileId)
            .then(setFileContent)
            .catch(error => setFileContent(`Failed to fetch file content: ${error}`))
    }, [fileId])

    return settings && fileContent ? (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>OpenCtx playground</h1>
                <nav>
                    {SAMPLE_FILES.map(id => (
                        <a key={id} href={`/?${id}`}>
                            {id.slice(id.lastIndexOf('/') + 1)}
                        </a>
                    ))}
                </nav>
            </header>
            <main className={styles.main}>
                <SettingsEditor
                    value={settings}
                    onChange={setSettings}
                    className={styles.editorContainer}
                    codeMirrorProps={{
                        theme: 'dark',
                        height: '100%',
                        style: { height: '100%', fontSize: '90%' },
                        className: styles.editor,
                    }}
                />
                <AnnotatedEditor
                    fileUri={`file:///${fileId}`}
                    value={fileContent}
                    onChange={setFileContent}
                    settings={settings}
                    className={styles.editorContainer}
                    codeMirrorProps={{
                        theme: 'dark',
                        height: '100%',
                        style: { height: '100%', fontSize: '90%' },
                        className: styles.editor,
                    }}
                />
            </main>
        </div>
    ) : null
}

const DEFAULT_FILE_ID =
    'github.com/sourcegraph/sourcegraph@1f857814717cf5afdb128eb005df93df5b81cc2a/client/web/src/auth/SignInPage.tsx'

async function fetchFileContent(fileId: string): Promise<string> {
    const localStorageKey = `fileContent:${fileId}`

    const item = localStorage.getItem(localStorageKey)
    if (item !== null) {
        return item
    }

    const fileUrl = `https://cdn.jsdelivr.net/gh/${fileId.replace(/^github\.com\//, '')}`
    const resp = await fetch(fileUrl)
    const content = await resp.text()
    localStorage.setItem(localStorageKey, content)
    return content
}
