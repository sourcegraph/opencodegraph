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

## Design

### Concepts

- Corpus: a set of documents, such as a documentation site for a library.
- Archive: a raw dump of the contents of a corpus, such as the full HTML content of all web pages on a documentation site.
- Index: a file containing pre-computed embeddings and full-text search indexes for all documents in an archive.

## Indexing a documentation corpus

- Create the corpus archive
- Index the corpus --> the index file is what's

```
time p -C provider/docs run -s docs-query 'redirect' $(find ~/src/github.com/vikejs/vike/docs/pages -type f)
time p -C provider/docs run -s docs-query 'making provider work in vscode' $(find ../../web/content/docs -type f)
p -C provider/docs run -s create-web-corpus https://docs.sourcegraph.com https://docs.sourcegraph.com https://docs.sourcegraph.com/@ cli/references .json .svg CHANGELOG > ~/tmp/ocg-provider-docs/sourcegraph-docs-old-web-corpus.json
```

## Development

- [Source code](https://sourcegraph.com/github.com/sourcegraph/opencodegraph/-/tree/provider/docs)
- [Docs](https://opencodegraph.org/docs/providers/docs)
- [Roadmap](https://github.com/sourcegraph/opencodegraph/issues/11)
- License: Apache 2.0
