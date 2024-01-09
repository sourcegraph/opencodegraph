
import path from 'path'
import { describe, expect, test } from 'vitest'
import {type AnnotationsResult, type CapabilitiesResult} from '@opencodegraph/provider'

import techstack, { type Settings } from './index'

describe('techstack', () => {
    const SETTINGS: Settings = {
        yaml: path.resolve(path.join(__dirname, './examples/mazure.yml'))
    }

    test('capabilities', () => {
        const result = techstack.capabilities({}, SETTINGS)

        expect(result).toBeDefined()
        expect(result).toStrictEqual<CapabilitiesResult>({
            selector: [{ path: '**/*.js' }, { path: '**/*.jsx' },
                       { path: '**/*.ts' }, { path: '**/*.tsx' }]
        })
    })

    test('annotations', async () => {
        let params = {
            file: 'file:///a/b.ts',
            content: `
import fs from 'fs'

fs.readFileSync('example.txt', 'utf-8)
`
        }
        let result = await techstack.annotations(params, SETTINGS)
        expect(result).toBeDefined()
        expect(result).toStrictEqual<AnnotationsResult>({ annotations: [], items: [] })

        SETTINGS.yaml = path.resolve(path.join(__dirname, './examples/stackshare.yml'))
        result = await techstack.annotations(params, SETTINGS)
        expect(result).toBeDefined()
        expect(result).toStrictEqual<AnnotationsResult>({ annotations: [], items: [] })

        params = {
            file: 'file:///c/d.ts',
            content: `
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
        result = await techstack.annotations(params, SETTINGS)
        expect(result).toBeDefined()
        expect(result.items[0].id).toEqual('1')
        expect(result.annotations[0].item.id).toEqual('1')
        expect(result.items[0].title).includes('npm Packages')

        params.content = `
var sass = require('node-sass');
sass.render({
    file: scss_filename,
    [, options..]
}, function(err, result) { /*...*/ });
// OR
sass = require('node-sass')  // unexpected import
        `
        result = await techstack.annotations(params, SETTINGS)
        expect(result).toBeDefined()
        expect(result.items[0].id).toEqual('1')
        expect(result.annotations[0].item.id).toEqual('1')
        expect(result.items[1].id).toEqual('7')
        expect(result.annotations[1].item.id).toEqual('7')
    })
})
