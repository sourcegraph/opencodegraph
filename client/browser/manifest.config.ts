import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'

const { version } = packageJson

// eslint-disable-next-line import/no-default-export
export default defineManifest(env => ({
    manifest_version: 3,
    name: env.mode === 'development' ? 'OpenCtx [dev]' : 'OpenCtx',
    description: "Enhance your code host's UI with contextual info from your other dev tools.",
    version,

    icons: {
        '32': 'icon-32.png',
        '48': 'icon-48.png',
        '128': 'icon-128.png',
    },
    action: {
        default_title: 'OpenCtx',
        default_icon: {
            '32': 'icon-32.png',
            '48': 'icon-48.png',
            '128': 'icon-128.png',
        },
        default_popup: 'src/options/options.html',
    },
    permissions: ['storage'],
    options_ui: {
        page: 'src/options/options.html',
        open_in_tab: true,
    },
    background: {
        service_worker: 'src/background/background.main.ts',
        type: 'module' as const,
    },
    content_scripts: [
        {
            matches: ['https://github.com/*'],
            js: ['src/contentScript/contentScript.main.ts'],
            run_at: 'document_idle',
        },
    ],
}))
