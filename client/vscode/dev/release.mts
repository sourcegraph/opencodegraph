import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import semver from 'semver'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * This script is used by the CI to publish the extension to the VS Code Marketplace and Open VSX Registry.
 *
 * See [CONTRIBUTING.md](../CONTRIBUTING.md) for instructions on how to generate a stable release or
 * insiders release.
 *
 * All release types are triggered by the CI and should not be run locally.
 */

const packageJSONPath = path.join(__dirname, '../package.json')
const packageJSONBody = fs.readFileSync(packageJSONPath, 'utf-8')
const packageJSON = JSON.parse(packageJSONBody) as { version: string }
const packageJSONVersionString = packageJSON.version
const packageJSONWasModified = false

// Check version validity.
const packageJSONVersion = semver.valid(packageJSONVersionString)
if (!packageJSONVersion) {
    console.error(
        `Invalid version in package.json: ${JSON.stringify(
            packageJSONVersionString
        )}. Versions must be valid semantic version strings.`
    )
    process.exit(1)
}

enum ReleaseType {
    /** Stable release */
    Stable = 'stable',

    /** Pre-release */
    Pre = 'pre',
}
const releaseType = process.env.RELEASE_TYPE
function validateReleaseType(releaseType: string | undefined): asserts releaseType is ReleaseType {
    if (!releaseType || !Object.values(ReleaseType).includes(releaseType as ReleaseType)) {
        console.error(
            `Invalid release type ${JSON.stringify(releaseType)}. Valid values are: ${JSON.stringify(
                Object.values(ReleaseType)
            )}. Specify a a release type in the RELEASE_TYPE env var.`
        )
        process.exit(1)
    }
}
validateReleaseType(releaseType)

const dryRun = Boolean(process.env.RELEASE_DRY_RUN)

// Tokens are stored in the GitHub repository's secrets.
const tokens = {
    vscode: dryRun ? 'dry-run' : process.env.VSCODE_MARKETPLACE_TOKEN,
    openvsx: dryRun ? 'dry-run' : process.env.VSCODE_OPENVSX_TOKEN,
}
if (!tokens.vscode || !tokens.openvsx) {
    console.error('Missing required tokens.')
    process.exit(1)
}

// The insiders build is the stable version suffixed with "-" and the Unix time.
//
// For example: 0.4.4 in package.json -> 0.4.4-1689391131.
const insidersVersion = semver.inc(packageJSONVersion, 'minor')?.replace(/\.\d+$/, `.${Math.ceil(Date.now() / 1000)}`)
if (!insidersVersion) {
    console.error('Could not increment version for insiders release.')
    process.exit(1)
}

const version = releaseType === ReleaseType.Pre ? insidersVersion : packageJSONVersion

// Package (build and bundle) the extension.
console.error(`Packaging ${releaseType} release at version ${version}...`)
execFileSync(
    'vsce',
    [
        'package',
        ...(releaseType === ReleaseType.Pre
            ? [insidersVersion, '--pre-release', '--no-update-package-json', '--no-git-tag-version']
            : []),
        '--no-dependencies',
        '--out',
        'dist/openctx.vsix',
    ],
    {
        stdio: 'inherit',
    }
)

// Add the esbuild wasm file.
execFileSync('mkdir', ['-p', 'extension/node_modules/esbuild-wasm'], { stdio: 'inherit' })
execFileSync(
    'cp',
    [
        'node_modules/esbuild-wasm/esbuild.wasm',
        'node_modules/esbuild-wasm/package.json',
        'extension/node_modules/esbuild-wasm/',
    ],
    {
        stdio: 'inherit',
    }
)
execFileSync(
    'zip',
    [
        '-ur',
        'dist/openctx.vsix',
        'extension/node_modules/esbuild-wasm/esbuild.wasm',
        'extension/node_modules/esbuild-wasm/package.json',
    ],
    {
        stdio: 'inherit',
    }
)
execFileSync('rm', ['-rf', 'extension/node_modules/esbuild-wasm/'], { stdio: 'inherit' })

// Publish the extension.
console.error(`Publishing ${releaseType} release at version ${version}...`)
if (dryRun) {
    console.error('Dry run complete. Skipping publish step.')
} else {
    // Publish to the VS Code Marketplace.
    execFileSync(
        'vsce',
        [
            'publish',
            ...(releaseType === ReleaseType.Pre ? ['--pre-release', '--no-git-tag-version'] : []),
            '--packagePath',
            'dist/openctx.vsix',
        ],
        {
            env: { ...process.env, VSCE_PAT: tokens.vscode },
            stdio: 'inherit',
        }
    )

    // Publish to the Open VSX Registry.
    execFileSync(
        'ovsx',
        [
            'publish',
            ...(releaseType === ReleaseType.Pre ? ['--pre-release'] : []),
            '--packagePath',
            'dist/openctx.vsix',
            '--pat',
            tokens.openvsx,
        ],
        {
            stdio: 'inherit',
        }
    )
}

if (packageJSONWasModified) {
    // Restore original package.json, only if it was modified during build.
    fs.writeFileSync(packageJSONPath, packageJSONBody)
}
