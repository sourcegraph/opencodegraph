// Import from a subpackage because the main module calls `os.platform()`, which doesn't work on
// non-Node engines.
//
// eslint-disable-next-line import/extensions
import matchGlob from 'picomatch/lib/picomatch.js'

export type { Provider as Provider } from './provider'
export type * from '@opencodegraph/schema'
export type * from '@opencodegraph/protocol'

// For convenience, since many providers need globs.
export { matchGlob }

export { type PositionCalculator, createFilePositionCalculator } from './helpers/position'
