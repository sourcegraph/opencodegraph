import { Provider } from '@openctx/provider'

const provider: Provider = {
    capabilities: () => ({ selector: [{ path: 'foo' }] }),
    items: () => [],
}

export default provider
