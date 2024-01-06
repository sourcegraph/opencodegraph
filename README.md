# <img src="https://storage.googleapis.com/sourcegraph-assets/opencodegraph/logomark-v0.png" width="36" height="36" alt="OpenCodeGraph logo"> OpenCodeGraph

<!-- Keep in sync with ./web/pages/index -->

See contextual info about code from your dev tools, in your editor and anywhere else you read code.

OpenCodeGraph is an open standard for annotating code with info from other dev tools (logs, docs, UI storybooks, service catalogs, analytics, etc.).

[**Get started**](https://opencodegraph.org/docs/start) in VS Code, GitHub (via browser extension), Sourcegraph, or in the playground.

See [opencodegraph.org](https://opencodegraph.org) for more info.

_Status: alpha_

---

## Screenshots

#### Hover over a UI component in your editor to see what it looks like

<img src="https://storage.googleapis.com/sourcegraph-assets/blog/screencast-vscode-storybook-v0.gif" width="560" alt="Screenshot of OpenCodeGraph annotations in VS Code" />
<br/><br/>

#### Jump from a GitHub PR to what a Prometheus metric is doing in prod

<img src="https://storage.googleapis.com/sourcegraph-assets/opencodegraph/screenshot-github-pr-prometheus-browser-v1.png" width="560" alt="Screenshot of OpenCodeGraph anotations in a GitHub pull request" />
<br/><br/>

#### See links to internal docs when reviewing code on GitHub

<img src="https://storage.googleapis.com/sourcegraph-assets/opencodegraph/screenshot-github-links-browser-v0.png" alt="Screenshot of OpenCodeGraph annotations in a GitHub code file" width="400" />
<br/><br/>

## Development

- [Source code](https://github.com/sourcegraph/opencodegraph)
- [Docs](https://opencodegraph.org)
- License: [Apache 2.0](LICENSE)

# TODOs

- Make the VS Code status bar toggle show/hide not enable/disable - and let it show/hide per-provider?
- Add support for "group"
