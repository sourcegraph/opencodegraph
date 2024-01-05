
import { describe, expect, test } from 'vitest'
import {type AnnotationsResult, type CapabilitiesResult} from '@opencodegraph/provider'

import techstack, { type Settings } from './index'


describe('techstack', () => {
    const SETTINGS: Settings = {
        yaml: './examples/mazure.yml'
    }

    test('capabilities', () => {
        let result = techstack.capabilities({}, SETTINGS)

        expect(result).toBeDefined()
        expect(result).toStrictEqual<CapabilitiesResult>({
            selector: [{ path: '**/*.js' }, { path: '**/*.ts' }]
        })
    })

    test('annotations', () => {
        let params = {
            file: 'file:///a/b.ts',
            content: `\n
            import fs from 'fs'

            fs.readFileSync('example.txt', 'utf-8)
            `
        }
        let result = techstack.annotations(params, SETTINGS)
        expect(result).toBeDefined()
        expect(result).toStrictEqual<AnnotationsResult>({ annotations: [], items: [] })

        SETTINGS.yaml = './examples/stackshare.yml'
        result = techstack.annotations(params, SETTINGS)
        expect(result).toBeDefined()
        expect(result).toStrictEqual<AnnotationsResult>({ annotations: [], items: [] })

        params = {
            file: 'file:///c/d.ts',
            content: `\n
            var sass = require('node-sass');
            sass.render({
                file: scss_filename,
                [, options..]
            }, function(err, result) { /*...*/ });
            // OR
            var result = sass.renderSync({
                data: scss_content
                [, options..]
            });
            `
        }
        result = techstack.annotations(params, SETTINGS)
        expect(result).toBeDefined()
        expect(Object.entries(result).length).toBeGreaterThan(0)
    })
})
