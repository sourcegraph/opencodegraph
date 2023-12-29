/** @type {import('@opencodegraph/provider').Provider} */
export default {
  capabilities() {
    throw new Error('capabilitiesThrow')
  },
  annotations() {
    return []
  },
}
