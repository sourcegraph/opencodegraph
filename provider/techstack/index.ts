import fs from 'fs'
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
function configuration(filename: string): TSF {
    const file = path.resolve(path.join(__dirname, filename))
    if (!fs.existsSync(file)) {
        return {} as TSF
    }
    const tsf = fs.readFileSync(file, 'utf-8')
    return YAML.parse(tsf)
}

const techstack: Provider<Settings> = {
    capabilities(params: CapabilitiesParams, settings: Settings): CapabilitiesResult {
        return { selector: [{ path: '**/*.js' }, { path: '**/*.ts' }] } // TODO: support more languages
    },

    annotations(params: AnnotationsParams, settings: Settings): AnnotationsResult {
        const result: AnnotationsResult = { items: [], annotations: [] }
        const importRegex = /\b(?:import\s*[\w{},\s]+|require\s*\([^)]+\))\s*/g

        if (settings.yaml !== null) {
            const spec = configuration(settings.yaml)
            const imports = params.content.split(/\r?\n/).filter(line => line.match(importRegex))
            const pkgs = spec.tools?.filter(t => t.detection_source === 'package.json')

            if (pkgs.length > 0) {
                imports.forEach((line, index) => {
                    const heading = pkgs.find(p => line.includes(p.name))
                    if (typeof heading !== 'undefined') {
                        const item: Item = { id: index.toString(), title: `📖 Techstack: ${heading}` }
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
