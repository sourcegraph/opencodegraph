global.__test__transportReuseInfo.moduleLoads++

/** @type {import('@openctx/provider').Provider} */
export default {
  capabilities() {
    global.__test__transportReuseInfo.capabilitiesCalls++
    return {}
  },
  annotations() {
    global.__test__transportReuseInfo.annotationsCalls++
    return []
  },
}
