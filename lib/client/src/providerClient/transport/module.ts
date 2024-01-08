import { type Provider } from '@openctx/provider'
import type { ProviderTransport, ProviderTransportOptions } from './createTransport'

export function createRemoteModuleFileTransport(
    providerUri: string,
    {
        dynamicImportFromUri,
        dynamicImportFromSource,
    }: Pick<ProviderTransportOptions, 'dynamicImportFromUri' | 'dynamicImportFromSource'>
): ProviderTransport {
    return lazyProvider(
        dynamicImportFromUri
            ? dynamicImportFromUri(providerUri).then(mod => providerFromModule(mod))
            : fetch(providerUri).then(async resp => {
                  if (!resp.ok) {
                      throw new Error(
                          `OpenCtx remote provider module URL ${providerUri} responded with HTTP error ${resp.status} ${resp.statusText}`
                      )
                  }
                  const contentType = resp.headers.get('Content-Type')?.trim()?.replace(/;.*$/, '')
                  if (
                      !contentType ||
                      (contentType !== 'text/javascript' &&
                          contentType !== 'application/javascript' &&
                          contentType !== 'text/plain')
                  ) {
                      throw new Error(
                          `OpenCtx remote provider module URL ${providerUri} reported invalid Content-Type ${JSON.stringify(
                              contentType
                          )} (expected "text/javascript" or "text/plain")`
                      )
                  }

                  const moduleSource = await resp.text()
                  try {
                      const mod = await importModuleFromString(providerUri, moduleSource, dynamicImportFromSource)
                      return providerFromModule(mod)
                  } catch (error) {
                      console.log(error)
                      throw error
                  }
              })
    )
}

export function createLocalModuleFileTransport(
    moduleUrl: string,
    { dynamicImportFromUri }: Pick<ProviderTransportOptions, 'dynamicImportFromUri'>
): ProviderTransport {
    return lazyProvider(
        // eslint-disable-next-line jsdoc/no-bad-blocks
        (dynamicImportFromUri ? dynamicImportFromUri(moduleUrl) : import(/* @vite-ignore */ moduleUrl)).then(
            providerFromModule
        )
    )
}

interface ProviderModule {
    // It is easy for module authors to misconfigure their bundler and emit a doubly nested
    // `default` export, so we handle that case gracefully.
    default: Provider | { default: Provider }
}

async function importModuleFromString(
    uri: string,
    source: string,
    dynamicImportFromSource: ProviderTransportOptions['dynamicImportFromSource']
): Promise<ProviderModule> {
    if (dynamicImportFromSource) {
        return (await dynamicImportFromSource(uri, source)).exports
    }

    // Note: Used by VS Code Web.
    const url = `data:text/javascript;charset=utf-8;base64,${base64Encode(source)}`
    // eslint-disable-next-line jsdoc/no-bad-blocks
    return import(/* @vite-ignore */ url)
}

/**
 * See https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem for why we need
 * something other than just `btoa` for base64 encoding.
 */
function base64Encode(text: string): string {
    const bytes = new TextEncoder().encode(text)
    const binString = String.fromCodePoint(...bytes)
    return btoa(binString)
}

function providerFromModule(providerModule: ProviderModule): Provider {
    let impl = providerModule.default
    if ('default' in impl) {
        impl = impl.default
    }
    return impl
}

function lazyProvider(provider: Promise<Provider>): ProviderTransport {
    return {
        capabilities: async (params, settings) => (await provider).capabilities(params, settings),
        items: async (params, settings) => (await provider).items(params, settings),
        dispose: () => {
            provider.then(provider => provider.dispose?.()).catch(error => console.error(error))
        },
    }
}
