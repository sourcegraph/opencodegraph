global.__test__transportReuseInfo.moduleLoads++

/** @type {import('@openctx/provider').Provider} */
export default {
  capabilities() {
    global.__test__transportReuseInfo.capabilitiesCalls++
    return {}
  },
  items() {
    global.__test__transportReuseInfo.itemsCalls++
    return []
  },
}
