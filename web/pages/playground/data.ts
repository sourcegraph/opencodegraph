import providerLinksUrl from '@openctx/provider-links?url'
import providerPrometheusUrl from '@openctx/provider-prometheus?url'
import providerStorybookUrl from '@openctx/provider-storybook?url'

export const INITIAL_FILE = {
    fileUri: 'file:///dir/SignInPage.story.tsx',
    fileContent: `
import { SignInPage, type SignInPageProps } from './SignInPage'
import styles from "./Story.module.css"

const config: Meta = {
	title: 'web/auth/SignInPage',
}

eventLogger.logEvent('PageView')

const gc = new prometheusClient.Summary({ name: 'go_gc_duration_seconds' })

const results = querySQL('SELECT * FROM user_accounts')

export const Default: StoryFn = () => (
	<WebStory>{() => <SignInPage context={context} authenticatedUser={null} />}</WebStory>
)

export const ShowMore: StoryFn = () => (
	<WebStory initialEntries={[{ pathname: '/sign-in', search: '?showMore' }]}>
			{() => <SignInPage context={{ ...context, primaryLoginProvidersCount: 1 }} authenticatedUser={null} />}
	</WebStory>
)

export const Dotcom: StoryFn = () => (
	<WebStory>
			{() => <SignInPage context={{ ...context, sourcegraphDotComMode: true }} authenticatedUser={null} />}
	</WebStory>
)
`.trim(),
}

function providerBundleUrl(packageName: string, importUrl: string): string {
    // Use clean URLs that refer to the published packages in the production build.
    if (import.meta.env.PROD) {
        return `https://openctx.org/npm/${packageName}`
    }

    const base = typeof window === 'undefined' ? import.meta.env.BASE_URL : window.origin
    return base === '/' ? importUrl : new URL(importUrl, base).toString()
}

const settings = {
    'openctx.providers': {
        [providerBundleUrl('@openctx/provider-links@0.0.5', providerLinksUrl)]: {
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
        [providerBundleUrl('@openctx/provider-prometheus@0.0.3', providerPrometheusUrl)]: {
            metricRegistrationPatterns: [
                {
                    path: '**/*.ts?(x)',
                    pattern: "new prometheusClient\\.(?:Histogram|Summary)\\({\\s*name: '([^']+)",
                    urlTemplate: 'https://prometheus.demo.do.prometheus.io/graph?g0.expr=$1&g0.tab=0&g0.stacked=1',
                },
            ],
        } satisfies import('@openctx/provider-prometheus').Settings,
        [providerBundleUrl('@openctx/provider-storybook@0.0.3', providerStorybookUrl)]: {
            storybookUrl: 'https://daeeaa811098f52f15a110dbaf76b6c416191c3b--5f0f381c0e50750022dc6bf7.chromatic.com/', // this is a public URL because our storybooks are public
        } satisfies import('@openctx/provider-storybook').Settings,
    },
}

export const INITIAL_SETTINGS = JSON.stringify(settings, null, 2)

/**
 * Preload resources that show up in the sample hovers for the items above so they are faster.
 */
export const PRELOAD_RESOURCES: { url: string; as: 'document' | 'image' | 'script' }[] = [
    {
        url: 'https://snapshots.chromatic.com/snapshots/5f0f381c0e50750022dc6bf7-655e91581b8b7b747a849436/capture-e85ed4b1.png',
        as: 'image',
    },
    {
        url: 'https://snapshots.chromatic.com/snapshots/5f0f381c0e50750022dc6bf7-655e91581b8b7b747a849434/capture-7cb01f8e.png',
        as: 'image',
    },
    {
        url: 'https://snapshots.chromatic.com/snapshots/5f0f381c0e50750022dc6bf7-655e91581b8b7b747a849435/capture-e729239.png',
        as: 'image',
    },
    ...Object.keys(settings['openctx.providers']).map(url => ({ url, as: 'script' as const })),
]
