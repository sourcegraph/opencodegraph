/** @type {import('@openctx/provider').OpenCtxProvider} */
module.exports = {
    capabilities: () => ({ selector: [{ path: 'foo' }] }),
}
