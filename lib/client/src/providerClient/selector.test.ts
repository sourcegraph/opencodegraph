import { type ItemsParams } from '@openctx/protocol'
import { describe, expect, test } from 'vitest'
import { matchSelectors } from './selector'

const FIXTURE_PARAMS: ItemsParams = {
    file: 'file:///dir1/dir2/file.txt',
    content: 'foo bar',
}

describe('matchSelectors', () => {
    test('undefined', () => {
        expect(matchSelectors(undefined)(FIXTURE_PARAMS)).toBeTruthy()
    })

    test('empty array', () => {
        expect(matchSelectors([])(FIXTURE_PARAMS)).toBeFalsy()
    })

    test('empty selectors', () => {
        expect(matchSelectors([{}])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{}, {}])(FIXTURE_PARAMS)).toBeTruthy()
    })

    test('path', () => {
        expect(matchSelectors([{ path: 'dir1/dir2/file.txt' }])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{ path: 'dir1/*/file.txt' }])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{ path: '*/*/file.txt' }])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{ path: '**/file.txt' }])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{ path: '**' }])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{ path: 'dir1/**' }])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{ path: '**/dir1/**' }])(FIXTURE_PARAMS)).toBeTruthy()

        expect(matchSelectors([{ path: 'file.txt' }])(FIXTURE_PARAMS)).toBeFalsy()
        expect(matchSelectors([{ path: 'dir2/file.txt' }])(FIXTURE_PARAMS)).toBeFalsy()
        expect(matchSelectors([{ path: '*.txt' }])(FIXTURE_PARAMS)).toBeFalsy()
        expect(matchSelectors([{ path: '*' }])(FIXTURE_PARAMS)).toBeFalsy()
        expect(matchSelectors([{ path: 'dir1' }])(FIXTURE_PARAMS)).toBeFalsy()
        expect(matchSelectors([{ path: 'dir1/dir2' }])(FIXTURE_PARAMS)).toBeFalsy()
    })

    test('contentContains', () => {
        expect(matchSelectors([{ contentContains: 'foo' }])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{ contentContains: 'bar' }])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{ contentContains: 'foo bar' }])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{ contentContains: '' }])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{ contentContains: 'baz' }])(FIXTURE_PARAMS)).toBeFalsy()
    })

    test('multiple conditions in a selector must all match', () => {
        expect(matchSelectors([{ path: '**', contentContains: 'xxx' }])(FIXTURE_PARAMS)).toBeFalsy()
        expect(matchSelectors([{ path: 'xxx', contentContains: 'foo' }])(FIXTURE_PARAMS)).toBeFalsy()
    })

    test('multiple selectors only need 1 of them to match', () => {
        expect(matchSelectors([{ path: '**' }, { contentContains: 'xxx' }])(FIXTURE_PARAMS)).toBeTruthy()
    })

    test('complex path', () => {
        expect(matchSelectors([{ path: '**/*.t?(xt)' }])(FIXTURE_PARAMS)).toBeTruthy()
        expect(matchSelectors([{ path: '**/*.(txt|png)' }])(FIXTURE_PARAMS)).toBeTruthy()
    })
})
