¿# Docs context provider for OpenCtx

This is a context provider for [OpenCtx](https://openctx.org) that adds contextual documentation to your code from an existing documentation corpus.

## Screenshot

![Screenshot of OpenCtx docs annotations](<TODO(sqs)>)

_TODO(sqs)_

Visit the [OpenCtx playground](https://openctx.org/playground) for a live example.

## Usage

Add the following to your settings in any OpenCtx client:

```json
"openctx.providers": {
    // ...other providers...
    "https://openctx.org/npm/@openctx/provider-docs": {
        // TODO(sqs)
    }
},
```

TODO(sqs)

See "[Configuration](#configuration)" for more.

Tips:

- If you're using VS Code, you can put the snippet above in `.vscode/settings.json` in the repository or workspace root to configure per-repository links.
- Play around with the docs provider in realtime on the [OpenCtx playground](https://openctx.org/playground).

## Configuration

<!-- Keep in sync with index.ts -->

```typescript
/** Settings for the docs OpenCtx provider. */
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
pnpm -C provider/docs run -s create-archive web '{"entryPage": "https://vitejs.dev/guide", "prefix": "https://vitejs.dev/guide", "ignore":[]}' > ~/tmp/octx-provider-docs/vite-docs-web-corpus.json

######### OLD below

time p -C provider/docs run -s docs-query 'redirect' $(find ~/src/github.com/vikejs/vike/docs/pages -type f)
time p -C provider/docs run -s docs-query 'making provider work in vscode' $(find ../../web/content/docs -type f)
p -C provider/docs run -s create-web-corpus https://docs.sourcegraph.com https://docs.sourcegraph.com https://docs.sourcegraph.com/@ cli/references .json .svg CHANGELOG > ~/tmp/octx-provider-docs/sourcegraph-docs-old-web-corpus.json
```

## Development

- [Source code](https://sourcegraph.com/github.com/sourcegraph/openctx/-/tree/provider/docs)
- [Docs](https://openctx.org/docs/providers/docs)
- [Roadmap](https://github.com/sourcegraph/openctx/issues/11)
- License: Apache 2.0
