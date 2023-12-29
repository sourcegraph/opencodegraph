# OpenCodeGraph extension for CodeMirror

The [`@opencodegraph/codemirror-extension`](https://www.npmjs.com/package/@opencodegraph/codemirror-extension) npm package implements a [CodeMirror](https://codemirror.net/) extension that shows [OpenCodeGraph](https://opencodegraph.org) annotations in the editor.

Check out the [OpenCodeGraph playground](https://opencodegraph.org/playground) for a live example of this extension.

## Usage

Install it:

```shell
npm install @opencodegraph/codemirror-extension @opencodegraph/client
```

Set up an OpenCodeGraph client and fetch annotations:

```typescript
import { createClient } from '@opencodegraph/client'

// Set up a client.
const client = createClient({
  configuration: () =>
    Promise.resolve({
      enable: true,
      providers: {
        'https://opencodegraph.org/npm/@opencodegraph/provider-hello-world': true,
      },
    }),
  makeRange: r => r,
  logger: console.error,
})

// Fetch annotations for the file.
const annotations = await client.annotations({ file: 'file:///foo.js', content: 'my file\nhello\nworld' })
```

Then register the extension with CodeMirror.

If you're using React, the `useOpenCodeGraphExtension` hook makes it easy:

```typescript
import { useOpenCodeGraphExtension } from '@opencodegraph/codemirror-extension'

function MyComponent() {
  // ...

  // A helpful React hook if using React.
  const ocgExtension = useOpenCodeGraphExtension({
    visibility: true,
    annotations,
  })

  // Pass `ocgExtension` to CodeMirror as an extension.

  // ...
}
```

Otherwise, set up the extension manually. If you're using React, you can get UI components from `@opencodegraph/ui-react`; otherwise, use `@opencodegraph/ui-standalone`.

```tsx
import type { Extension } from '@codemirror/state'
import { openCodeGraphData, showOpenCodeGraphDecorations } from '@opencodegraph/codemirror-extension'
import { ChipList, IndentationWrapper } from '@opencodegraph/ui-react'

const ocgExtension: Extension = [
  openCodeGraphData(annotations),
  showOpenCodeGraphDecorations({
    visibility: true,
    createDecoration(container, { indent, annotations }) {
      const root = createRoot(container)
      root.render(
        <IndentationWrapper indent={indent}>
          <ChipList annotations={annotations} chipClassName="ocg-chip" popoverClassName="ocg-chip-popover" />
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

// Pass `ocgExtension` to CodeMirror as an extension.
```

## Demo

The [OpenCodeGraph playground](https://opencodegraph.org/playground) is a live demo of this extension.

You can also clone this repository and run `pnpm run demo` from this directory, then visit http://localhost:5902. See the `demo/` dir for source code.

## Development

- [Source code](https://sourcegraph.com/github.com/sourcegraph/opencodegraph/-/tree/client/codemirror)
- [Docs](https://opencodegraph.org/docs/clients/codemirror)
- License: Apache 2.0
