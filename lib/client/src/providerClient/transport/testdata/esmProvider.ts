import { Provider } from '@opencodegraph/provider'

const provider: Provider = {
    capabilities: () => ({ selector: [{ path: 'foo' }] }),
    annotations: () => [],
}

export default provider
