import { type CorpusData } from '../data'
import { type Doc } from '../doc/doc'

export interface CorpusSource {
    docs(): Promise<Doc[]>
}

export function corpusDataSource(data: CorpusData | Promise<CorpusData>): CorpusSource {
    return {
        docs: async () => (await data).docs,
    }
}

export function corpusDataURLSource(url: string): CorpusSource {
    return corpusDataSource(
        fetch(url).then(resp => {
            if (!resp.ok) {
                throw new Error(`failed to fetch corpus data from ${url}: ${resp.status} ${resp.statusText}`)
            }
            if (!resp.headers.get('Content-Type')?.includes('json')) {
                throw new Error(`corpus data from ${url} is not JSON`)
            }
            return resp.json()
        })
    )
}
