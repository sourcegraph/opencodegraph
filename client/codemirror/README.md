# OpenCtx extension for CodeMirror

The [`@openctx/codemirror-extension`](https://www.npmjs.com/package/@openctx/codemirror-extension) npm package implements a [CodeMirror](https://codemirror.net/) extension that shows [OpenCtx](https://openctx.org) items in the editor.

Check out the [OpenCtx playground](https://openctx.org/playground) for a live example of this extension.

## Usage

Install it:

```shell
npm install @openctx/codemirror-extension @openctx/client
```

Set up an OpenCtx client and fetch items:

```typescript
import { createClient } from '@openctx/client'

// Set up a client.
const client = createClient({
  configuration: () =>
    Promise.resolve({
      enable: true,
      providers: {
        'https://openctx.org/npm/@openctx/provider-hello-world': true,
      },
    }),
  makeRange: r => r,
  logger: console.error,
})

// Fetch items for the file.
const items = await client.items({ file: 'file:///foo.js', content: 'my file\nhello\nworld' })
```

Then register the extension with CodeMirror.

If you're using React, the `useOpenCtxExtension` hook makes it easy:

```typescript
import { useOpenCtxExtension } from '@openctx/codemirror-extension'

function MyComponent() {
  // ...

  // A helpful React hook if using React.
  const octxExtension = useOpenCtxExtension({
    visibility: true,
    items,
  })

  // Pass `octxExtension` to CodeMirror as an extension.

  // ...
}
```

Otherwise, set up the extension manually. If you're using React, you can get UI components from `@openctx/ui-react`; otherwise, use `@openctx/ui-standalone`.

```tsx
import type { Extension } from '@codemirror/state'
import { openCtxData, showOpenCtxDecorations } from '@openctx/codemirror-extension'
import { ChipList, IndentationWrapper } from '@openctx/ui-react'

const octxExtension: Extension = [
  openCtxData(items),
  showOpenCtxDecorations({
    visibility: true,
    createDecoration(container, { indent, items }) {
      const root = createRoot(container)
      root.render(
        <IndentationWrapper indent={indent}>
          <ChipList items={items} chipClassName="octx-chip" popoverClassName="octx-chip-popover" />
        </IndentationWrapper>
      )
      return {
        destroy() {
          root.unmount()
        },
      }
    },
  }),
]

// Pass `octxExtension` to CodeMirror as an extension.
```

## Demo

The [OpenCtx playground](https://openctx.org/playground) is a live demo of this extension.

You can also clone this repository and run `pnpm run demo` from this directory, then visit http://localhost:5902. See the `demo/` dir for source code.

## Development

- [Source code](https://sourcegraph.com/github.com/sourcegraph/openctx/-/tree/client/codemirror)
- [Docs](https://openctx.org/docs/clients/codemirror)
- License: Apache 2.0
