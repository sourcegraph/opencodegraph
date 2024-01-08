
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

import type TSF from './techstack.schema'
export interface Settings { yaml: string }

/**
 * Read the techstack file configuration for project
 *
 * @param filename - techstack yml filename
 * @returns parsed yaml object
 */
async function load(filename: string): Promise<TSF> {
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

    async annotations(params: AnnotationsParams, settings: Settings): Promise<AnnotationsResult> {
        const result: AnnotationsResult = { items: [], annotations: [] }
        const regex = /\b(?:import\s*[\w{},\s]+|require\s*\([^)]+\))\s*/g

        if (settings.yaml !== null) {
            const targets = params.content
                .split(/\r?\n/)
                .map((line, index) => line.match(regex) ? {[index]: line} : null)
            const report = await load(settings.yaml)
            const pkgs = report.tools?.filter(t => t.detection_source === 'package.json')

            if (pkgs.length > 0) {
                targets.forEach((line, index) => {
                    if (line !== null) {
                        const target = Object.values(line as object).pop()
                        const linenum = Object.keys(line as object).pop()
                        const tool = pkgs.find(p => target.includes(p.name))
                        if (tool !== undefined) {
                            const item: Item = {
                                id: linenum?.toString() || '-1',
                                title: `📖 Techstack: ${tool.sub_category}`,
                                url: tool.website_url ?? tool.package_url
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
                    }
                })
            }
        }

        return result
    },
}

export default techstack
