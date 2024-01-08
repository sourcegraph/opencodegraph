import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

// TODO(sqs): un-hardcode
const docsProviderDataDir = resolve('/home/sqs/tmp/octx-provider-docs')

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    resolve: {
        alias: [
            ...(mode === 'development'
                ? [
                      // In dev mode, build from TypeScript sources so we don't need to run `tsc -b`
                      // in the background.
                      //
                      // TODO(sqs): dedupe with other places in this repo that do this
                      {
                          find: /^(@openctx\/[\w-]+)$/,
                          replacement: '$1/src/index',
                      },
                  ]
                : []),
            {
                find: 'tmp-octx-provider-docs',
                replacement: docsProviderDataDir,
            },
        ],
    },
    define: {},
    css: {
        devSourcemap: true,
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
    server: {
        port: 5900,
        fs: {
            allow: [searchForWorkspaceRoot(process.cwd()), docsProviderDataDir],
        },
    },
    build: {
        emptyOutDir: false,
        outDir: 'dist',
        rollupOptions: {
            watch: {
                // https://rollupjs.org/configuration-options/#watch
                include: ['src/**'],
                exclude: ['node_modules'],
            },
            input: {
                index: resolve(__dirname, 'index.html'),
            },
            output: {
                entryFileNames: '[name].js',
            },
        },
    },
}))
