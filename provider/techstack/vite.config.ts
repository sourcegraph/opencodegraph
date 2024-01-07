
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'


export default defineConfig({
    assetsInclude: [ '**/*.yml' ],
    plugins: [
        nodePolyfills({ include: ['path'] })
    ]
})
