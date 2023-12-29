import { type Annotation, type AnnotationsParams } from '@opencodegraph/client'
import { createItemChipList } from '@opencodegraph/ui-standalone'
import { combineLatest, EMPTY, filter, fromEvent, map, mergeMap, startWith, tap, type Observable } from 'rxjs'
import { DEBUG, debugTap } from '../debug'
import { withDOMElements } from '../detectElements'
import { annotationsByLine, LINE_CHIPS_CLASSNAME, styledItemChipListParams } from '../ocgUtil'

/**
 * Inject OpenCodeGraph features into the GitHub pull request files view.
 *
 * Good URLs to test on:
 *
 * - Small PR: https://github.com/sourcegraph/sourcegraph/pull/59084/files
 * - Medium PR: https://github.com/sourcegraph/sourcegraph/pull/58878/files
 * - Large PR: https://github.com/sourcegraph/sourcegraph/pull/58886/files
 */
export function injectOnGitHubPullRequestFilesView(
    location: URL,
    annotationsChanges: (params: AnnotationsParams) => Observable<Annotation[]>
): Observable<void> {
    // All GitHub PR file view URLs contain `/pull/` and `/files` in the path.
    if (!location.pathname.includes('/pull/') && !location.pathname.endsWith('/files')) {
        return EMPTY
    }

    return combineLatest([
        // If these don't emit, then the page is not recognized as a GitHub PR files view. This means
        // it's a different GitHub page, or the DOM structure has changed significantly.
        withDOMElements<HTMLElement>('.diff-view .file'),
        clicksThatInvalidateDiffViewData.pipe(startWith(undefined)),
    ]).pipe(
        mergeMap(([fileEls]) => {
            const diffData = getDiffViewData(fileEls)
            if (DEBUG) {
                console.log('diffData', diffData)
            }
            return combineLatest(
                diffData.files
                    .flatMap(file => [file.oldFile, file.newFile])
                    .map(file =>
                        annotationsChanges({ content: file.content, file: `github://${file.path}` }).pipe(
                            tap(annotations => {
                                try {
                                    redraw(file, annotations)
                                } catch (error) {
                                    console.error(error)
                                }
                            }),
                            map(() => undefined)
                        )
                    )
            )
        }),
        map(() => undefined)
    )
}

function getItemChipListElementsAtEndOfLine(lineEl: HTMLElement): HTMLElement[] {
    // There might be 2 of these in a unified (non-split) diff, since one was added by each of the old
    // and new file's providers.
    return [
        lineEl.childNodes.item(lineEl.childNodes.length - 2) as ChildNode | undefined,
        lineEl.childNodes.item(lineEl.childNodes.length - 1) as ChildNode | undefined,
    ].filter((el): el is HTMLElement =>
        Boolean(el instanceof HTMLElement && el.classList.contains(LINE_CHIPS_CLASSNAME))
    )
}

function redraw(file: DiffViewFileVersionData, annotations: Annotation[]): void {
    // TODO(sqs): use line numbers as though they were in the original file, not just the displayed
    // excerpt from the diff.

    const lineEls = file.tableEl.querySelectorAll<HTMLElement>(file.codeSelector)
    for (const { line, annotations: lineAnnotations } of annotationsByLine(annotations)) {
        const lineEl = lineEls[line]
        if (!lineEl) {
            console.error(`could not find lineEl for line ${line} (lineEls.length == ${lineEls.length})`)
            continue
        }

        for (const chipListEl of getItemChipListElementsAtEndOfLine(lineEl)) {
            chipListEl.remove()
        }

        const chipList = createItemChipList(
            styledItemChipListParams({
                annotations: lineAnnotations.map(ann => ann.item),
            })
        )
        lineEl.append(chipList)
    }
}

/**
 * Listen for clicks on elements that, when clicked, invalidate this data.
 */
const clicksThatInvalidateDiffViewData: Observable<void> = fromEvent(document.body, 'click').pipe(
    filter(ev => {
        let target = ev.target
        if (target instanceof SVGSVGElement) {
            target = target.parentElement
        }
        if (!(target instanceof HTMLElement)) {
            return false
        }

        return target.classList.contains('directional-expander')
    }),

    // Wait for it to show up. Mark .blob-expanded elements that we've seen so that this works for
    // multiple expansions.
    mergeMap(() =>
        withDOMElements('tr.blob-expanded:not(.ocg-seen)').pipe(
            tap(els => {
                for (const el of els) {
                    el.classList.add('ocg-seen')
                }
            })
        )
    ),

    map(() => undefined),
    debugTap(() => console.log('clicksThatInvalidateDiffViewData'))
)

interface DiffViewData {
    files: DiffViewFileData[]
}

interface DiffViewFileData {
    oldFile: DiffViewFileVersionData
    newFile: DiffViewFileVersionData
}

interface DiffViewFileVersionData {
    path: string
    content: string
    tableEl: HTMLTableElement
    codeSelector: string
}

function getDiffViewData(fileEls: HTMLElement[]): DiffViewData {
    return {
        files: fileEls.map(getFileData),
    }

    function getFileData(fileEl: HTMLElement): DiffViewFileData {
        const tableEl = fileEl.querySelector<HTMLTableElement>('table.diff-table')
        if (!tableEl) {
            throw new Error('could not find table.diff-table')
        }

        const oldFile: DiffViewFileVersionData = {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            path: fileEl.dataset.tagsearchPath!, //  TODO(sqs): support renamed files
            content: fileContentFromDiffViewSelector(tableEl, codeSelector(tableEl, 'old')),
            tableEl,
            codeSelector: codeSelector(tableEl, 'old'),
        }

        const newFile: DiffViewFileVersionData = {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            path: fileEl.dataset.tagsearchPath!, //  TODO(sqs): support renamed files
            content: fileContentFromDiffViewSelector(tableEl, codeSelector(tableEl, 'new')),
            tableEl,
            codeSelector: codeSelector(tableEl, 'new'),
        }

        return { oldFile, newFile }
    }
}

function codeSelector(tableEl: HTMLTableElement, version: 'old' | 'new'): string {
    const isSplitDiff = tableEl.classList.contains('file-diff-split')
    if (isSplitDiff) {
        return version === 'old'
            ? 'td[data-split-side="left"] .blob-code-inner, td[data-split-side="left"].blob-code-inner'
            : 'td[data-split-side="right"] .blob-code-inner, td[data-split-side="right"].blob-code-inner'
    }

    // Omit .blob-expanded from the new version of the code to avoid double annotations.
    return version === 'old'
        ? ':where(.blob-code-context, .blob-code-deletion, .blob-expanded) .blob-code-inner'
        : ':where(.blob-code-context, .blob-code-addition) .blob-code-inner'
}

function fileContentFromDiffViewSelector(fileDiffTableEl: HTMLTableElement, selector: string): string {
    const els = Array.from(fileDiffTableEl.querySelectorAll<HTMLElement>(selector))

    return els
        .map(el => {
            // Ignore innerText from the OCG chip.
            const chipListEls = getItemChipListElementsAtEndOfLine(el)
            for (const chipListEl of chipListEls) {
                chipListEl.hidden = true
            }

            const innerText = el.innerText

            for (const chipListEl of chipListEls) {
                chipListEl.hidden = false
            }

            // If the innerText is just `\n`, then treat it as empty so we don't have single empty lines ending up as `\n\n`.
            if (innerText === '\n' || innerText === '\r\n') {
                return ''
            }

            return innerText
        })
        .join('\n')
}
