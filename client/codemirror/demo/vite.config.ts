/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
    plugins: [],
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
        port: 5902,
    },
    test: { name: 'codemirror-demo' },
}))
