import { type AuthInfo } from '@openctx/client'
import { BehaviorSubject, type Observable } from 'rxjs'
import * as vscode from 'vscode'

// TODO(sqs): un-hardcode
const HOSTNAMES_NEEDING_ACCESS_TOKENS = ['sourcegraph.com', 'sourcegraph.test', 'sourcegraph.sourcegraph.com']

const SECRET_STORAGE_KEY_PREFIX = 'openctx:access-token:'

function secretStorageKey(hostname: string): string {
    return `${SECRET_STORAGE_KEY_PREFIX}${hostname}`
}

export function secretsChanges(secrets: vscode.SecretStorage): {
    disposable: vscode.Disposable
    observable: Observable<vscode.SecretStorage>
} {
    const disposables: vscode.Disposable[] = []

    const subject = new BehaviorSubject<vscode.SecretStorage>(secrets)
    disposables.push(
        secrets.onDidChange(e => {
            if (e.key.startsWith(SECRET_STORAGE_KEY_PREFIX)) {
                subject.next(secrets)
            }
        })
    )

    disposables.push(
        vscode.commands.registerCommand('openctx.clearAuthentication', async () => {
            for (const hostname of HOSTNAMES_NEEDING_ACCESS_TOKENS) {
                await secrets.delete(secretStorageKey(hostname))
            }
            await vscode.window.showInformationMessage('Cleared OpenCtx authentication.')
            promptedForAuthInfo.clear() // reset prompts
        })
    )

    return { disposable: vscode.Disposable.from(...disposables), observable: subject }
}

export async function getAuthInfo(secrets: vscode.SecretStorage, providerUri: string): Promise<AuthInfo | null> {
    const hostname = new URL(providerUri).hostname
    if (!HOSTNAMES_NEEDING_ACCESS_TOKENS.includes(hostname)) {
        return null
    }
    let value = await secrets.get(secretStorageKey(hostname))
    if (!value) {
        value = await promptForAuthInfo(secrets, hostname)
    }
    return value
        ? {
              headers: { Authorization: `token ${value}` },
          }
        : null
}

// Don't bother the user again if they dismiss the auth info prompt
const promptedForAuthInfo = new Map<URL['hostname'], boolean>()

async function promptForAuthInfo(secrets: vscode.SecretStorage, hostname: string): Promise<string | undefined> {
    const alreadyPrompted = promptedForAuthInfo.get(hostname)
    if (alreadyPrompted) {
        return undefined
    }
    promptedForAuthInfo.set(hostname, true)

    const value = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        title: `OpenCtx: Enter access token for ${hostname}:`,
    })
    if (value) {
        await secrets.store(secretStorageKey(hostname), value)
    }
    return value
}
