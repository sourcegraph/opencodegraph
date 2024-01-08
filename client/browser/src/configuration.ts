import { type ClientConfiguration } from '@openctx/client'
import { parse as parseJSONC, type ParseError } from 'jsonc-parser'
import { map, type Observable } from 'rxjs'
import { observeStorageKey } from './browser-extension/web-extension-api/storage'

const DEFAULT_CONFIG: ClientConfiguration = {
    enable: true,
    providers: {
        'https://openctx.org/npm/@openctx/provider-hello-world': true,
        'https://openctx.org/npm/@openctx/provider-links': {
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
                    title: '🐘 $<table> table (PostgreSQL console)',
                    url: 'https://example.com/postgresql?table=$<table|queryEscape>',
                    description: 'View table schema and data...',
                    path: '**',
                    pattern: '(FROM|UPDATE|INSERT INTO|DELETE FROM|ALTER TABLE) (?<table>\\w+)',
                },
            ],
        } satisfies import('@openctx/provider-links').Settings,
        'https://openctx.org/npm/@openctx/provider-prometheus': {
            metricRegistrationPatterns: [
                {
                    path: '**/*.go',
                    pattern: 'prometheus\\.HistogramOpts{\\s*Name:\\s*"([^"]+)',
                    urlTemplate: 'https://prometheus.demo.do.prometheus.io/graph?g0.expr=$1&g0.tab=0&g0.stacked=1',
                },
            ],
        } satisfies import('@openctx/provider-prometheus').Settings,
        'https://openctx.org/npm/@openctx/provider-storybook': {
            storybookUrl: 'https://daeeaa811098f52f15a110dbaf76b6c416191c3b--5f0f381c0e50750022dc6bf7.chromatic.com/', // this is a public URL because our storybooks are public
        } satisfies import('@openctx/provider-storybook').Settings,
    },
}

export const configurationStringChanges: Observable<string> = observeStorageKey('sync', 'configuration').pipe(
    map(c => c ?? { jsonc: JSON.stringify(DEFAULT_CONFIG, null, 2) }),
    map(({ jsonc: jsoncStr }) => jsoncStr)
)

export const configurationChanges: Observable<ClientConfiguration> = configurationStringChanges.pipe(
    map(jsoncStr => {
        const errors: ParseError[] = []
        const obj = parseJSONC(jsoncStr, errors, {
            allowTrailingComma: true,
        }) as ClientConfiguration
        if (errors.length > 0) {
            console.error('Error parsing configuration (as JSONC):', errors)
        }
        return obj
    })
)
