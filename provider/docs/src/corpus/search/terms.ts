export type Term = string

/**
 * All terms in the text, with normalization and stemming applied.
 */
export function terms(text: string): Term[] {
    return (
        text
            .toLowerCase()
            .split(/[^\w-]+/)
            // TODO(sqs): get a real stemmer
            .map(term => term.replace(/(.*)(?:es|ed|ing|s|er)$/, '$1'))
    )
}
