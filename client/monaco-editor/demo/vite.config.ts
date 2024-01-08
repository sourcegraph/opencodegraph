/// <reference types="vitest" />
import { defineConfig } from 'vite'
import monacoEditorPlugin_ from 'vite-plugin-monaco-editor'

// Hack because the plugin function's export is incorrect.
const monacoEditorPlugin: typeof monacoEditorPlugin_ = (monacoEditorPlugin_ as any).default

export default defineConfig(({ mode }) => ({
    plugins: [monacoEditorPlugin({})],
    resolve: {
        alias:
            mode === 'development'
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
                : [],
    },
    css: {
        devSourcemap: true,
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
    server: {
        port: 5901,
    },
    test: { name: 'monaco-editor-demo' },
}))
