import path from 'path'
import { type ClientConfiguration } from '@openctx/client'
import * as vscode from 'vscode'

/**
 * @param scope The file or other scope for which to get configuration.
 * @param __mock__getConfiguration For use by tests only.
 */
export function getClientConfiguration(
    scope?: vscode.ConfigurationScope,
    __mock__getConfiguration?: typeof vscode.workspace.getConfiguration
): ClientConfiguration & { debug?: boolean } {
    const config = (__mock__getConfiguration ?? vscode.workspace.getConfiguration)('openctx', scope)
    return {
        enable: config.get('enable'),
        providers: resolveProviderUrisInConfig(config, scope),
        debug: config.get<boolean>('debug'),
    }
}

/**
 * Resolve provider URIs in the configuration. For example, if a `.vscode/settings.json` workspace
 * folder configuration file references a provider at `../foo.js` or `file://../bar.js`, those URIs
 * need to be resolved relative to the `.vscode/settings.json` file.
 *
 * TODO(sqs): support `${workspaceRoot}` and `${workspaceFolder}`?
 */
function resolveProviderUrisInConfig(
    config: vscode.WorkspaceConfiguration,
    scope?: vscode.ConfigurationScope
): ClientConfiguration['providers'] {
    const info = config.inspect<ClientConfiguration['providers']>('providers')
    if (!info) {
        return undefined
    }

    const merged: NonNullable<ClientConfiguration['providers']> = {}

    /**
     * Allow the use of `../path/to/module.js` and `./path/to/module.js` in the
     * `openctx.providers` setting.
     */
    function rewriteProviderRelativeFilePaths(
        providers: ClientConfiguration['providers'],
        fromUri?: vscode.Uri
    ): ClientConfiguration['providers'] {
        if (!providers || !fromUri) {
            return undefined
        }
        return Object.fromEntries(
            Object.entries(providers).map(([providerUri, settings]) => {
                const isRelativeFilePath =
                    providerUri.startsWith('../') ||
                    providerUri.startsWith('./') ||
                    providerUri.startsWith(`..${path.sep}`) ||
                    providerUri.startsWith(`.${path.sep}`)
                if (isRelativeFilePath) {
                    providerUri = fromUri.with({ path: path.resolve(fromUri.path, providerUri) }).toString()
                }
                return [providerUri, settings]
            })
        )
    }

    const scopeUri = scope && ('uri' in scope ? scope.uri : 'fsPath' in scope ? scope : scope.uri)
    const workspaceFile = vscode.workspace.workspaceFile?.with({
        path: path.dirname(vscode.workspace.workspaceFile.path),
    })
    const workspaceFolder = scopeUri ? vscode.workspace.getWorkspaceFolder(scopeUri) : undefined
    const workspaceFolderSettingsFileUri = workspaceFolder
        ? workspaceFolder.uri.with({ path: workspaceFolder.uri.path + '/.vscode' })
        : undefined
    if (info.defaultValue) {
        Object.assign(merged, info.defaultValue)
    }
    if (info.globalValue) {
        Object.assign(merged, info.globalValue)
    }
    if (info.workspaceValue && workspaceFile) {
        Object.assign(merged, rewriteProviderRelativeFilePaths(info.workspaceValue, workspaceFile))
    }
    if (info.workspaceFolderValue) {
        Object.assign(
            merged,
            rewriteProviderRelativeFilePaths(info.workspaceFolderValue, workspaceFolderSettingsFileUri)
        )
    }
    if (info.defaultLanguageValue) {
        Object.assign(merged, info.defaultLanguageValue)
    }
    if (info.globalLanguageValue) {
        Object.assign(merged, info.globalLanguageValue)
    }
    if (info.workspaceLanguageValue && workspaceFile) {
        Object.assign(merged, rewriteProviderRelativeFilePaths(info.workspaceLanguageValue, workspaceFile))
    }
    if (info.workspaceFolderLanguageValue) {
        Object.assign(
            merged,
            rewriteProviderRelativeFilePaths(info.workspaceFolderLanguageValue, workspaceFolderSettingsFileUri)
        )
    }

    return merged
}
