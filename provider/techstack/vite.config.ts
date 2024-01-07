
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'


export default defineConfig({
    assetsInclude: [ '**/*.yml' ],
    plugins: [
        nodePolyfills({
            protocolImports: true,
            include: ['fs', 'path'],
            overrides: { fs: 'memfs' }
        })
    ]
})
