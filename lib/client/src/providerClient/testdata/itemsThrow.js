/** @type {import('@openctx/provider').Provider} */
export default {
  capabilities() {
    return {}
  },
  items() {
    throw new Error('itemsThrow')
  },
}
