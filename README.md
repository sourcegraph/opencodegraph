# <img src="https://storage.googleapis.com/sourcegraph-assets/openctx/logomark-v0.png" width="36" height="36" alt="OpenCtx logo"> OpenCtx

<!-- Keep in sync with ./web/pages/index -->

See contextual info about code from your dev tools, in your editor and anywhere else you read code.

OpenCtx is an open standard for annotating code with info from other dev tools (logs, docs, UI storybooks, service catalogs, analytics, etc.).

[**Get started**](https://openctx.org/docs/start) in VS Code, GitHub (via browser extension), Sourcegraph, or in the playground.

See [openctx.org](https://openctx.org) for more info.

_Status: alpha_

---

## Screenshots

#### Hover over a UI component in your editor to see what it looks like

<img src="https://storage.googleapis.com/sourcegraph-assets/blog/screencast-vscode-storybook-v0.gif" width="560" alt="Screenshot of OpenCtx annotations in VS Code" />
<br/><br/>

#### Jump from a GitHub PR to what a Prometheus metric is doing in prod

<img src="https://storage.googleapis.com/sourcegraph-assets/openctx/screenshot-github-pr-prometheus-browser-v1.png" width="560" alt="Screenshot of OpenCtx anotations in a GitHub pull request" />
<br/><br/>

#### See links to internal docs when reviewing code on GitHub

<img src="https://storage.googleapis.com/sourcegraph-assets/openctx/screenshot-github-links-browser-v0.png" alt="Screenshot of OpenCtx annotations in a GitHub code file" width="400" />
<br/><br/>

## Development

- [Source code](https://github.com/sourcegraph/openctx)
- [Docs](https://openctx.org)
- License: [Apache 2.0](LICENSE)

---

OpenCtx

Annotations - should generalize and just make it ContextItems. Adds context about code files, chat messages, etc. Attachment can be a file range,
.

Not just context, but also actions.

OpenCtx
