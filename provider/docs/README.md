¿# Docs context provider for OpenCodeGraph

This is a context provider for [OpenCodeGraph](https://opencodegraph.org) that adds contextual documentation to your code from an existing documentation corpus.

## Screenshot

![Screenshot of OpenCodeGraph docs annotations](<TODO(sqs)>)

_TODO(sqs)_

Visit the [OpenCodeGraph playground](https://opencodegraph.org/playground) for a live example.

## Usage

Add the following to your settings in any OpenCodeGraph client:

```json
"opencodegraph.providers": {
    // ...other providers...
    "https://opencodegraph.org/npm/@opencodegraph/provider-docs": {
        // TODO(sqs)
    }
},
```

TODO(sqs)

See "[Configuration](#configuration)" for more.

Tips:

- If you're using VS Code, you can put the snippet above in `.vscode/settings.json` in the repository or workspace root to configure per-repository links.
- Play around with the docs provider in realtime on the [OpenCodeGraph playground](https://opencodegraph.org/playground).

## Configuration

<!-- Keep in sync with index.ts -->

```typescript
/** Settings for the docs OpenCodeGraph provider. */
export interface Settings {
  // TODO(sqs)
}
```

## Development

- [Source code](https://sourcegraph.com/github.com/sourcegraph/opencodegraph/-/tree/provider/docs)
- [Docs](https://opencodegraph.org/docs/providers/docs)
- License: Apache 2.0

```
time p run -s docs-query 'redirect' $(find ~/src/github.com/vikejs/vike/docs/pages -type f)
time p run -s docs-query 'making provider work in vscode' $(find ../../web/content/docs -type f)
```

TODOs:

- simplify cache interface
- deal with different content types (markdown/html) differently
- make it slurp up gdocs/confluence/markdown in repos
- show OCG annotations (but in a way that doesn't overlay lines in the file, is more passive?)
- show a demo of Cody working with this
- show docs most relevant to the current visible portion or the selection, not the whole file
