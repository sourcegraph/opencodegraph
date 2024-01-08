// VS Code does not support dynamically import()ing ES modules (see
// https://github.com/microsoft/vscode/issues/130367). But we always want OpenCtx providers to
// be ES modules for consistency. So, we need to rewrite the ESM bundle to CommonJS to import it
// here.
//
// Note that it's deceiving because VS Code using extensionDevelopmentPath *does* support dynamic
// import()s, but they fail when installing the extension from a `.vsix` (including from the
// extension marketplace).
//
// When VS Code supports dynamic import()s for extensions, we can remove this.

import { readFile } from 'fs/promises'
import { type Provider } from '@openctx/client'
import * as esbuild from 'esbuild-wasm/esm/browser'
import * as vscode from 'vscode'

function requireFromString(cjsSource: string, filename: string): { default: Provider } {
    const Module: any = module.constructor
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const m = new Module()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    m._compile(cjsSource, filename)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return m.exports
}

export async function dynamicImportFromSource(
    _uri: string,
    esmSource?: string
): Promise<{ exports: { default: Provider } }> {
    if (esmSource === undefined) {
        throw new Error('vscode dynamicImport requires esmSource')
    }
    const cjsSource = await esmToCommonJS(esmSource)
    const cjsModule = requireFromString(cjsSource, '<CJS-STRING>')
    return Promise.resolve({ exports: cjsModule })
}

export async function esmToCommonJS(esmSource: string): Promise<string> {
    await initializeEsbuildOnce()
    const cjsSource = await esbuild.transform(esmSource, { format: 'cjs', target: 'esnext' })
    return cjsSource.code
}

let esbuildInitialization: Promise<void> | undefined
async function initializeEsbuildOnce(): Promise<void> {
    if (esbuildInitialization) {
        return esbuildInitialization
    }

    async function run(): Promise<void> {
        if (typeof self === 'undefined') {
            // Required for tests to pass in Node.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            ;(globalThis as any).self = globalThis
        }

        const initOptions: esbuild.InitializeOptions = { worker: false }

        if (vscode.env.uiKind === vscode.UIKind.Desktop && process.env.DESKTOP_BUILD) {
            if (!globalThis.crypto) {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                globalThis.crypto ??= require('crypto')
            }
            const wasmModule = await readFile(require.resolve('esbuild-wasm/esbuild.wasm'))
            initOptions.wasmModule = new WebAssembly.Module(wasmModule)
        } else {
            throw new Error('not implemented - VS Code Web uses dynamic import()')
        }
        return esbuild.initialize(initOptions)
    }

    esbuildInitialization = run()
    return esbuildInitialization
}
