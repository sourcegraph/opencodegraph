/**
 * Indents its content by the specified whitespace. This is used to align OpenCodeGraph chips with
 * the non-whitespace characters on the line they're attached to.
 */
export function createIndentationWrapper({
    indent,
    extraMargin,
    children,
}: {
    indent: string | undefined
    extraMargin?: number
    children: HTMLElement | HTMLElement[]
}): HTMLElement {
    const container = document.createElement('div')
    container.style.display = 'flex'
    if (extraMargin) {
        container.style.marginLeft = `${extraMargin}px`
    }

    const pre = document.createElement('pre')
    pre.style.height = '0'
    pre.style.flex = '0 0 auto'
    pre.style.overflow = 'hidden'
    pre.style.visibility = 'hidden'
    if (indent) {
        pre.innerText = indent
    }

    container.append(pre, ...(Array.isArray(children) ? children : [children]))

    return container
}
