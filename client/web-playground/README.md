# OpenCtx web playground

To run: `pnpm run dev`

It is currently hard-coded to use `https://sourcegraph.test:3443/.api/openctx` as the sole provider. You need to give it a Sourcegraph access token (in the browser devtools console):

```
localStorage.sourcegraphTestAccessToken = 'YOUR ACCESS TOKEN'
location.reload()
```
