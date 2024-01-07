import { describe, expect, test } from 'vitest'
import { terms } from './terms'

describe('terms', () => {
    test('splits, stems, normalizes', () => {
        expect(terms('my apples are cooler when =  stored, oh my')).toEqual(['apple', 'cool', 'stor', 'oh'])
    })
})
