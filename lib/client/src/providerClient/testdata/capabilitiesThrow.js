/** @type {import('@openctx/provider').Provider} */
export default {
  capabilities() {
    throw new Error('capabilitiesThrow')
  },
  annotations() {
    return []
  },
}
