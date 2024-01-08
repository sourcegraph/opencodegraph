import * as vscode from 'vscode'
import { type ExtensionApi } from './api'
import { secretsChanges } from './authInfo'
import { createController } from './controller'

/**
 * Start the extension, watching all relevant configuration and secrets for changes.
 */
export function activate(context: vscode.ExtensionContext): ExtensionApi {
    const outputChannel = vscode.window.createOutputChannel('OpenCtx')
    context.subscriptions.push(outputChannel)

    const { disposable: disposable0, observable: secrets } = secretsChanges(context.secrets)
    context.subscriptions.push(disposable0)

    const { disposable: disposable1, api } = createController(secrets, outputChannel)
    context.subscriptions.push(disposable1)

    return api
}
