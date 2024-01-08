import type { Extension } from '@codemirror/state'
import { type Item } from '@openctx/client'
import { ChipList, IndentationWrapper } from '@openctx/ui-react'
import { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { openCtxData, showOpenCtxDecorations } from './extension'

export function useOpenCtxExtension({
    visibility,
    items,
}: {
    visibility: boolean
    items: Item[] | undefined
}): Extension {
    // TODO(sqs): useCompartment results in sometimes the facet data being stale because the editor is reconfigured
    return useMemo(
        () =>
            visibility
                ? [
                      openCtxData(items),
                      showOpenCtxDecorations({
                          visibility,
                          createDecoration(container, { indent, items }) {
                              const root = createRoot(container)
                              root.render(
                                  <IndentationWrapper indent={indent}>
                                      <ChipList
                                          items={items}
                                          chipClassName="octx-chip"
                                          popoverClassName="octx-chip-popover"
                                      />
                                  </IndentationWrapper>
                              )
                              return {
                                  destroy() {
                                      root.unmount()
                                  },
                              }
                          },
                      }),
                  ]
                : [],
        [visibility, items]
    )
}
