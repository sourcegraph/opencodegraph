# OpenCtx extension for Monaco Editor

The [`@openctx/monaco-editor-extension`](https://www.npmjs.com/package/@openctx/monaco-editor-extension) npm package implements a [Monaco Editor](https://microsoft.github.io/monaco-editor/) extension that shows [OpenCtx](https://openctx.org) annotations on files.

## Usage

Install it:

```shell
npm install @openctx/monaco-editor-extension @openctx/client
```

Set up an OpenCtx client:

```typescript
import { createClient } from '@openctx/client'
import { createExtension, makeRange } from '@openctx/monaco-editor-extension'

// Set up a client.
const client = createClient({
  configuration: () =>
    Promise.resolve({
      enable: true,
      providers: {
        'https://openctx.org/npm/@openctx/provider-hello-world': true,
      },
    }),
  makeRange,
  logger: console.error,
})

// Now, get the editor object that refers to the Monaco editor you want to
// extend. Some code calls monaco.editor.create directly, and some code uses
// a wrapper around Monaco.
const editor: monaco.editor.IStandaloneCodeEditor = monaco.editor.create(/* ... */)

// Then create the extension and call it on the Monaco editor object.
const disposable = createExtension(client)(editor)

// Call disposable.dispose() when done to free resources.
```

## Demo

Clone this repository and run `pnpm run demo` from this directory, then visit http://localhost:5901. See the `demo/` dir for source code.

## Development

- [Source code](https://sourcegraph.com/github.com/sourcegraph/openctx/-/tree/client/monaco-editor)
- [Docs](https://openctx.org/docs/clients/monaco-editor)
- License: Apache 2.0
