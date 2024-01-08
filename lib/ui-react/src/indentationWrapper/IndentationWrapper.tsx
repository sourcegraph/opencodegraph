import { type FunctionComponent, type ReactNode } from 'react'

/**
 * Indents its content by the specified whitespace. This is used to align OpenCtx chips with
 * the non-whitespace characters on the line they're attached to.
 */
export const IndentationWrapper: FunctionComponent<{
    indent: string | undefined
    extraMargin?: number
    children: ReactNode
}> = ({ indent, extraMargin, children }) => (
    // eslint-disable-next-line react/forbid-dom-props
    <div style={{ display: 'flex', marginLeft: extraMargin ? `${extraMargin}px` : undefined }}>
        {/* eslint-disable-next-line react/forbid-dom-props */}
        <pre style={{ height: 0, overflow: 'hidden', visibility: 'hidden' }}>{indent}</pre>
        {children}
    </div>
)
