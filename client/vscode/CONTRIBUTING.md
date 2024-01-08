# Contributing to OpenCtx for VS Code

## Getting started

1. Run `pnpm install` (see [repository setup instructions](../../doc/dev/index.md) if you don't have `pnpm`).
1. Open this repository in VS Code and run the `Launch VS Code Extension (Desktop)` build/debug task (or run `cd client/vscode && pnpm run dev`).

## Issues

File issues in the [OpenCtx issue tracker](https://github.com/sourcegraph/openctx/issues).

## Tests

- Unit tests: `pnpm run test:unit`
- Integration tests: `pnpm run test:integration`

## Releases

### Stable builds

To publish a new release to the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sourcegraph.openctx) and [Open VSX Registry](https://open-vsx.org/extension/sourcegraph/openctx):

1. Increment the `version` in [`package.json`](package.json) and [`CHANGELOG`](CHANGELOG.md).
1. Commit the version increment.
1. `git tag vscode-v$(jq -r .version package.json)`
1. `git push --tags`
1. Wait for the [vscode-stable-release workflow](https://github.com/sourcegraph/openctx/actions/workflows/vscode-stable-release.yml) run to finish.

### Pre-release builds

Pre-release builds are nightly (or more frequent) builds with the latest from `main`. They're less stable but have the latest changes. Only use the pre-release build if you want to test the latest changes.

#### Using the pre-release build

To use the OpenCtx pre-release build in VS Code:

1. Install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sourcegraph.openctx) or the [Open VSX Registry](https://open-vsx.org/extension/sourcegraph/openctx).
1. Select **Switch to Pre-release Version** in the extension's page in VS Code.
1. Wait for it to download and install, and then reload (by pressing **Reload Required**).

#### Publishing a new pre-release build

Pre-release builds are published automatically daily at 1500 UTC using the [vscode-pre-release workflow](https://github.com/sourcegraph/openctx/actions/workflows/vscode-pre-release.yml).

To manually trigger a pre-release build:

1. Open the [vscode-pre-release workflow](https://github.com/sourcegraph/openctx/actions/workflows/vscode-pre-release.yml).
1. Press the **Run workflow ▾** button.
1. Select the branch you want to build from (usually `main`).
1. Press the **Run workflow** button.
1. Wait for the workflow run to finish.

### Running a release build locally

To build and run the packaged extension locally:

1. Run `pnpm install` (see [repository setup instructions](../../doc/dev/index.md) if you don't have `pnpm`).
1. `cd client/vscode` (from the root of this repository)
1. `pnpm vscode:prepublish`
1. Uninstall any existing OpenCtx extension from VS Code.
1. `code --install-extension dist/openctx.vsix`

#### Simulating a fresh user install

VS Code will preserve some extension state (e.g., configuration settings) even when an extension is uninstalled. To replicate the flow of a completely new user, run a separate instance of VS Code:

```shell
code --user-data-dir=/tmp/separate-vscode-instance --profile-temp
```

## Developing with another VS Code extension

If you're working on another VS Code extension that uses the OpenCtx extension's API, you can use `pnpm link` to develop using your local packages.

In the other extension's package directory, run:

```shell
pnpm link /path/to/openctx/lib/client
```
