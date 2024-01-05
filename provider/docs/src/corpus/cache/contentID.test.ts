import { describe, expect, test } from 'vitest'
import { contentID } from './contentID'

describe('contentID', () => {
    test('returns the content ID', async () => {
        expect(await contentID('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    })
})
