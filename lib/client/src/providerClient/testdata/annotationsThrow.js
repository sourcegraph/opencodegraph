/** @type {import('@openctx/provider').Provider} */
export default {
  capabilities() {
    return {}
  },
  annotations() {
    throw new Error('annotationsThrow')
  },
}
