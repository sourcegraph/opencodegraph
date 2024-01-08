import { MockedObject, vi } from 'vitest'
import { Controller } from './controller'

export function createMockController(): MockedObject<Controller> {
    return {
        observeAnnotations: vi.fn(),
        onDidChangeProviders: vi.fn(),
    }
}
