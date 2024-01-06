export const isWebWindowRuntime = typeof window !== 'undefined'

export const useWebWorker = isWebWindowRuntime
