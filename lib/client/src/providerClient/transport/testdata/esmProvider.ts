import { Provider } from '@openctx/provider'

const provider: Provider = {
    capabilities: () => ({ selector: [{ path: 'foo' }] }),
    annotations: () => [],
}

export default provider
