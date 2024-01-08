/** @type {import('@openctx/provider').Provider} */
module.exports = {
  capabilities: () => ({ selector: [{ path: 'foo' }] }),
}
