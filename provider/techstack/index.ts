
import path from 'path'
import YAML from 'yaml'
import {
    type AnnotationsParams,
    type AnnotationsResult,
    type CapabilitiesParams,
    type CapabilitiesResult,
    type Item,
    type Provider
} from '@opencodegraph/provider'

import TSF from './techstack.schema'
export interface Settings { yaml: string }


/**
 * Read the techstack file configuration for project
 *
 * @param filename - techstack yml filename
 * @returns parsed yaml object
 */
async function configuration(filename: string): Promise<TSF> {
    const cpath: string = new URL(import.meta.url).pathname
    const fileUrl: string = import.meta.resolve(
        path.resolve(path.join(path.dirname(cpath), filename)))
    const r: Response = await fetch(fileUrl)

    if (r.status !== 200) {
        console.error(`Techstack: failed to fetch settings from ${filename}`)
        return {} as TSF
    }
    return YAML.parse(await r.text())
}

const techstack: Provider<Settings> = {
    capabilities(params: CapabilitiesParams, settings: Settings): CapabilitiesResult {
        // TODO: support more languages
        return { selector: [{ path: '**/*.js' }, { path: '**/*.jsx' },
                            { path: '**/*.ts' }, { path: '**/*.tsx' }] }
    },

    annotations(params: AnnotationsParams, settings: Settings): AnnotationsResult {
        const result: AnnotationsResult = { items: [], annotations: [] }
        const regex = /\b(?:import\s*[\w{},\s]+|require\s*\([^)]+\))\s*/g

        if (settings.yaml !== null) {
            const spec = configuration(settings.yaml)
            const targets = params.content
                .split(/\r?\n/)
                .map((line, index) => line.match(regex) ? {[index]: line} : null)
                .filter(line => line !== null)
            const pkgs = spec.tools?.filter(t => t.detection_source === 'package.json')

            if (pkgs.length > 0) {
                targets.forEach((line, index) => {
                    const target = Object.values(line as Object).pop()
                    const linenum = Object.keys(line as Object).pop()
                    const heading = pkgs.find(p => target.includes(p.name))

                    if (typeof heading !== 'undefined') {
                        const item: Item = {
                            id: linenum?.toString() || '-1',
                            title: `📖 Techstack: ${heading.sub_category}`
                        }

                        // Populate results
                        result.items.push(item)
                        result.annotations.push({
                            item: { id: item.id },
                            range: {
                                start: { line: index, character: 0 },
                                end: { line: index, character: 1 }
                            }
                        })
                    }
                })
            }
        }

        return result
    },
}

export default techstack
