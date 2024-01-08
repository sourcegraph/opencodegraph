# OpenCtx browser extension

The [OpenCtx](https://openctx.org) browser extension enhances your code host's UI with contextual info from your other dev tools.

## Usage

**Install it for:**

- [Google Chrome](https://chromewebstore.google.com/detail/indllinbfleghfhhaglfgohfceffendm)
- Coming soon: Firefox, Safari, Brave, Arc, Edge, and any other browser that supports the [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)

Supported code hosts:

- [GitHub](https://openctx.org/docs/clients/github) (code view, pull request diff view)
- Coming soon: GitLab, Bitbucket Cloud & Server

### Setup

After installing it in Chrome, visit the following pages to see it in action:

- [Example code file on GitHub](https://github.com/sourcegraph/sourcegraph/blob/main/internal/repos/conf.go)
- [Example pull request on GitHub](https://github.com/sourcegraph/sourcegraph/pull/58878/files)

Click the extension's icon to change your [configuration](https://openctx.org/docs/concepts#user-configuration).

## Screenshots

![Screenshot of OpenCtx annotations in a GitHub pull request](https://storage.googleapis.com/sourcegraph-assets/openctx/screenshot-browser-github-pr-v0.png)

_See relevant docs when reviewing a GitHub PR_

![Screenshot of OpenCtx annotations in the GitHub code view](https://storage.googleapis.com/sourcegraph-assets/openctx/screenshot-browser-github-codeview-v0.png)

_And when viewing files on GitHub._

## Known issues

### No remotely hosted `.js` OpenCtx providers

Because of the [restriction on remotely hosted code](https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code) in Chrome extensions, the browser extension does not support all OpenCtx context providers.

Supported providers:

- All providers that are implemented as an [HTTP endpoint](https://openctx.org/docs/protocol)
- The following additional providers:
  - [Links](https://openctx.org/docs/providers/links)
  - [Storybook](https://openctx.org/docs/providers/storybook)
  - [Prometheus](https://openctx.org/docs/providers/prometheus)
  - [Hello World](https://openctx.org/docs/providers/hello-world)

Unsupported providers:

- Any other provider that is implemented as a JavaScript bundle executed on the client

### GitHub pull request files are annotated with only partial file contents

Only the displayed portion of the diffs of GitHub pull request files are sent to the OpenCtx provider. Providers do not receive the full contents of the changed files, nor do they receive the diff markers to let them know whether each line was an addition, removal, edit, or context.

## Development

- [Source code](https://sourcegraph.com/github.com/sourcegraph/openctx/-/tree/client/browser)
- [Docs](https://openctx.org/docs/clients/browser-extension)
- License: Apache 2.0
