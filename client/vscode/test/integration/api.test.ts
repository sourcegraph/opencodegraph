import * as assert from 'assert'
import * as vscode from 'vscode'
import type { ExtensionApi } from '../../src/api'

suite('API', () => {
    test('get exported extension API', async () => {
        // Wait for the extension to become ready.
        const ext = vscode.extensions.getExtension<ExtensionApi>('sourcegraph.openctx')
        assert.ok(ext, 'extension not found')

        const api = await ext.activate()

        assert.ok(api.apiVersion(1))
    })
})
