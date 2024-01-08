import { createClient, type ClientConfiguration } from '@openctx/client'
import { createExtension, makeRange } from '@openctx/monaco-editor-extension'
import providerHelloWorldUrl from '@openctx/provider-hello-world?url'
import * as monaco from 'monaco-editor'

const container = document.createElement('div')
container.id = 'container'
container.style.width = '100%'
container.style.height = '100%'
document.body.append(container)

const editor = monaco.editor.create(container, {
    value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `console.log("Hello, world #${n}");`).join('\n'),
    language: 'javascript',
    theme: 'vs-dark',
    minimap: { enabled: false },
    renderWhitespace: 'none',
    fontSize: 16,
})

const client = createClient({
    configuration: () =>
        Promise.resolve({
            enable: true,
            providers: {
                [new URL(providerHelloWorldUrl, window.origin).toString()]: true,
            },
        } satisfies ClientConfiguration),
    makeRange,
})

createExtension(client)(editor)
