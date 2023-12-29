import { type ProviderSettings } from '@opencodegraph/client'

const USE_STORED_CORPUS = true

async function getProviders(): Promise<Record<string, ProviderSettings | boolean>> {
    const providerSettings: Record<string, ProviderSettings | boolean> = {
        '../../../../provider/hello-world/index.ts': true,
        // '../../../../provider/docs/src/provider/provider.ts': {
        //     corpus: USE_STORED_CORPUS
        //         ? {
        //               url: new URL(
        //                   'tmp-ocg-provider-docs/sourcegraph-docs-old-web-corpus.json',
        //                   import.meta.url
        //               ).toString(),
        //           }
        //         : {
        //               entryPage: 'http://localhost:5800/docs/start',
        //               prefix: 'http://localhost:5800/docs',
        //           },
        // } satisfies import('@opencodegraph/provider-docs').Settings,
        '../../../../provider/links/index.ts': {
            links: [
                {
                    title: 'Telemetry',
                    url: 'https://docs.sourcegraph.com/dev/background-information/telemetry#sourcegraph-web-app',
                    type: 'docs',
                    path: '**/*.ts?(x)',
                    pattern: 'eventLogger\\.',
                },
                {
                    title: 'CSS in client/web',
                    url: 'https://docs.sourcegraph.com/dev/background-information/web/styling#styling-ui',
                    type: 'docs',
                    path: '**/*.ts?(x)',
                    pattern: '^import styles from',
                },
                {
                    title: 'Bazel at Sourcegraph',
                    url: 'https://docs.sourcegraph.com/dev/background-information/bazel#bazel-at-sourcegraph',
                    type: 'docs',
                    path: '**/{BUILD.bazel,*.bzl,*.bazelrc,WORKSPACE}',
                },
                {
                    title: 'View all Storybooks',
                    url: 'https://www.chromatic.com/library?appId=5f0f381c0e50750022dc6bf7',
                    description: 'On Chromatic',
                    path: '**/{*.{stories,story}.ts?(x),.storybook/**}',
                },
            ],
        } satisfies import('@opencodegraph/provider-links').Settings,
        '../../../../provider/storybook/index.ts': {
            storybookUrl: 'https://<branch>--5f0f381c0e50750022dc6bf7.chromatic.com/',
        } satisfies import('@opencodegraph/provider-storybook').Settings,
    }

    const providerModules = import.meta.glob('../../../../provider/{*/index.ts,docs/src/provider/provider.ts}', {
        as: 'url',
    })
    for (const [path, url] of Object.entries(providerModules)) {
        const providerUri = new URL(await url(), import.meta.url).toString()
        const settings = providerSettings[path] ?? false // TODO(sqs): back to true
        delete providerSettings[path]
        providerSettings[providerUri] = settings
    }

    return providerSettings
}

export async function getDefaultSettings(): Promise<string> {
    const providers = await getProviders()
    return JSON.stringify({ 'opencodegraph.providers': providers }, null, 2)
}
