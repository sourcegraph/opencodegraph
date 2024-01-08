import '../shared/polyfills'
// ^^ import polyfills first
import { createClient } from '@openctx/client'
import { type Provider } from '@openctx/provider'
import helloWorldProvider from '@openctx/provider-hello-world'
import linksProvider from '@openctx/provider-links'
import prometheusProvider from '@openctx/provider-prometheus'
import storybookProvider from '@openctx/provider-storybook'
import { Subscription } from 'rxjs'
import { addMessageListenersForBackgroundApi } from '../browser-extension/web-extension-api/rpc'
import { configurationChanges } from '../configuration'

const BUILTIN_PROVIDER_MODULES: Record<string, Provider<any>> = {
    ['https://openctx.org/npm/@openctx/provider-hello-world']: helloWorldProvider,
    ['https://openctx.org/npm/@openctx/provider-links']: linksProvider,
    ['https://openctx.org/npm/@openctx/provider-storybook']: storybookProvider,
    ['https://openctx.org/npm/@openctx/provider-prometheus']: prometheusProvider,
}

function getBuiltinProvider(uri: string): Provider {
    const mod = BUILTIN_PROVIDER_MODULES[uri]
    if (!mod) {
        throw new Error(
            `Only HTTP endpoint providers and the following built-in providers are supported: ${Object.keys(
                BUILTIN_PROVIDER_MODULES
            ).join(', ')}. See https://openctx.org/docs/clients/browser-extension#known-issues.`
        )
    }
    return mod
}

function main(): void {
    const subscriptions = new Subscription()

    const client = createClient({
        configuration: () => configurationChanges,
        logger: console.error,
        makeRange: r => r,
        dynamicImportFromUri: uri => Promise.resolve({ default: getBuiltinProvider(uri) }),
    })
    subscriptions.add(() => client.dispose())

    subscriptions.add(
        addMessageListenersForBackgroundApi({
            annotationsChanges: (...args) => client.annotationsChanges(...args),
        })
    )

    self.addEventListener('unload', () => subscriptions.unsubscribe(), { once: true })
}

// Browsers log an unhandled Promise here automatically with a nice stack trace, so we don't need to
// `.catch(...)` it.
main()
