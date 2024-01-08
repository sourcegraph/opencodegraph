import { remarkCodeHike } from '@code-hike/mdx'
import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react-swc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import vike from 'vike/plugin'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
    plugins: [
        mdx({
            providerImportSource: '@mdx-js/react',
            remarkPlugins: [[remarkCodeHike, { theme: 'github-from-css' }]],
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
            remarkRehypeOptions: { allowDangerousHtml: true },
        }),
        vike({ prerender: true }),
        react(),
    ],
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
    optimizeDeps: { include: ['react/jsx-runtime', 'react/jsx-dev-runtime', 'vike-react/renderer/onRenderClient'] },
    server: {
        port: 5800,
    },
    css: {
        devSourcemap: true,
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
}))
