import type { Extension } from '@codemirror/state'
import { type Annotation } from '@opencodegraph/client'
import { IndentationWrapper, ItemChipList } from '@opencodegraph/ui-react'
import { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { openCodeGraphData, showOpenCodeGraphDecorations } from './extension'

export function useOpenCodeGraphExtension({
    visibility,
    annotations,
}: {
    visibility: boolean
    annotations: Annotation[] | undefined
}): Extension {
    // TODO(sqs): useCompartment results in sometimes the facet data being stale because the editor is reconfigured
    return useMemo(
        () =>
            visibility
                ? [
                      openCodeGraphData(annotations),
                      showOpenCodeGraphDecorations({
                          visibility,
                          createDecoration(container, { indent, items }) {
                              const root = createRoot(container)
                              root.render(
                                  <IndentationWrapper indent={indent}>
                                      <ItemChipList
                                          items={items}
                                          chipClassName="ocg-chip"
                                          popoverClassName="ocg-chip-popover"
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
        [visibility, annotations]
    )
}
