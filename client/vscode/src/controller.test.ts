import { describe, expect, MockedObject, test, vi } from 'vitest'
import { Controller } from './controller'

export function createMockController(): MockedObject<Controller> {
    return {
        observeAnnotations: vi.fn(),
        onDidChangeProviders: vi.fn(),
    }
}

describe('dummy', () =>
    test('dummy', () => {
        expect(true).toBe(true)
    }))
