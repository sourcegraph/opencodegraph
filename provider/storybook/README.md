# Storybook context provider for OpenCtx

This is a context provider for [OpenCtx](https://openctx.org) that annotates your React components and `*.story.ts?(x)` files with screenshots and links to your [Storybook](https://storybook.js.org/) component library. It works well with storybooks hosted on [Chromatic](https://chromatic.com/).

## Screenshot

![Screenshot of OpenCtx annotations for Storybook in a code file](https://storage.googleapis.com/sourcegraph-assets/blog/screencast-vscode-storybook-v0.gif)

_Hover over a UI component in code to see what it looks like_

Visit the [OpenCtx playground](https://openctx.org/playground) for live examples.

## Usage

Add the following to your settings in any OpenCtx client:

```json
"openctx.providers": {
    // ...other providers...
    "https://openctx.org/npm/@openctx/provider-storybook": {
        "storybookUrl": "<URL to the Storybook for your application>"
    }
},
```

Tips:

- If you're using VS Code, you can put the snippet above in `.vscode/settings.json` in each repository if you have different storybooks per-repository.
- To use this with storybooks hosted on [Chromatic](https://chromatic.com/), see below in the "[Configuration](#configuration)" section.
- Play around with the Storybook provider in realtime on the [OpenCtx playground](https://openctx.org/playground).

## Configuration

<!-- Keep in sync with index.ts -->

```typescript
/** Settings for the Storybook OpenCtx provider. */
interface Settings {
  /**
   * The URL to a published Storybook for your project.
   *
   * If you're using Chromatic, this is of the form `https://<branch>--<appid>.chromatic.com`; see
   * https://www.chromatic.com/docs/permalinks/#get-permalinks-to-your-project for how to obtain
   * this value.
   *
   * If the URL contains `<branch>`, it will always be replaced with `main`.
   *
   * TODO(sqs): Support non-main branches.
   */
  storybookUrl: string
}
```

## Development

- [Source code](https://sourcegraph.com/github.com/sourcegraph/openctx/-/tree/provider/storybook)
- [Docs](https://openctx.org/docs/providers/storybook)
- License: Apache 2.0
