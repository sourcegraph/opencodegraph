import {
    groupAnnotations,
    prepareAnnotationsForPresentation,
    type AnnotationWithAdjustedRange,
} from '@openctx/ui-common'
import { firstValueFrom, map, type Observable } from 'rxjs'
import * as vscode from 'vscode'
import { makeRange, type Controller } from '../../controller'

interface CodeLens extends vscode.CodeLens {}

export function createCodeLensProvider(controller: Controller): vscode.CodeLensProvider<CodeLens> & {
    observeCodeLenses(doc: vscode.TextDocument): Observable<CodeLens[]>
} & vscode.Disposable {
    const disposables: vscode.Disposable[] = []

    const showHover = createShowHoverCommand()
    disposables.push(showHover)

    const showGroup = createShowGroupCommand()
    disposables.push(showGroup)

    const changeCodeLenses = new vscode.EventEmitter<void>()
    disposables.push(changeCodeLenses)

    disposables.push(controller.onDidChangeProviders(() => changeCodeLenses.fire()))

    const provider = {
        onDidChangeCodeLenses: changeCodeLenses.event,
        observeCodeLenses(doc: vscode.TextDocument): Observable<CodeLens[]> {
            return controller.observeAnnotations(doc).pipe(
                map(anns => {
                    if (anns === null) {
                        return []
                    }
                    const { groups, ungrouped } = groupAnnotations(
                        prepareAnnotationsForPresentation<vscode.Range>(anns, makeRange)
                    )
                    return [
                        ...groups.map(([group, anns]) => groupCodeLens(group, anns, showGroup)),
                        ...ungrouped.map(ann => annotationCodeLens(doc, ann, showHover)),
                    ]
                })
            )
        },
        async provideCodeLenses(doc: vscode.TextDocument): Promise<CodeLens[]> {
            return firstValueFrom(provider.observeCodeLenses(doc), { defaultValue: [] })
        },
        dispose() {
            for (const disposable of disposables) {
                disposable.dispose()
            }
        },
    }
    return provider
}

/** Create a code lens for a single annotation. */
function annotationCodeLens(
    doc: vscode.TextDocument,
    ann: AnnotationWithAdjustedRange<vscode.Range>,
    showHover: ReturnType<typeof createShowHoverCommand>
): CodeLens {
    // If the presentationHint `show-at-top-of-file` is used, show the code lens at the top of the
    // file, but make it trigger the hover at its actual location.
    const attachRange = ann.range ?? new vscode.Range(0, 0, 0, 0)
    const hoverRange = ann.originalRange ?? attachRange
    return {
        range: attachRange,
        command: {
            title: ann.title,
            ...(ann.ui?.detail && !ann.ui.presentationHints?.includes('prefer-link-over-detail')
                ? showHover.createCommandArgs(doc.uri, hoverRange.start)
                : ann.url
                ? openWebBrowserCommandArgs(ann.url)
                : { command: 'noop' }),
        },
        isResolved: true,
    }
}

function createShowHoverCommand(): {
    createCommandArgs: (uri: vscode.Uri, pos: vscode.Position) => Pick<vscode.Command, 'command' | 'arguments'>
} & vscode.Disposable {
    const COMMAND_ID = 'openctx._showHover'
    const disposable = vscode.commands.registerCommand(COMMAND_ID, (uri: vscode.Uri, pos: vscode.Position): void => {
        const editor = vscode.window.activeTextEditor
        if (!editor || editor.document.uri.toString() !== uri.toString()) {
            return
        }
        editor.selections = [new vscode.Selection(pos, pos)]
        // eslint-disable-next-line no-void
        void vscode.commands.executeCommand('editor.action.showHover')
    })
    return {
        createCommandArgs(uri, pos) {
            return {
                command: COMMAND_ID,
                arguments: [uri, pos],
            }
        },
        dispose() {
            disposable.dispose()
        },
    }
}

/** Create a code lens for a group of annotations. */
function groupCodeLens(
    group: string,
    anns: AnnotationWithAdjustedRange<vscode.Range>[],
    showGroup: ReturnType<typeof createShowGroupCommand>
): CodeLens {
    // Attach to the range of the first annotation with a range.
    const attachRange = anns.find(ann => ann.range)?.range ?? new vscode.Range(0, 0, 0, 0)
    return {
        range: attachRange,
        command: {
            title: group,
            ...showGroup.createCommandArgs(group, anns),
        },
        isResolved: true,
    }
}

function createShowGroupCommand(): {
    createCommandArgs: (
        group: string,
        annotations: AnnotationWithAdjustedRange<vscode.Range>[]
    ) => Pick<vscode.Command, 'command' | 'arguments'>
} & vscode.Disposable {
    const disposables: vscode.Disposable[] = []

    const COMMAND_ID = 'openctx._showGroup'

    interface QuickPickItem extends vscode.QuickPickItem {
        annotation: AnnotationWithAdjustedRange<vscode.Range>
    }
    const quickPick = vscode.window.createQuickPick<QuickPickItem>()
    disposables.push(quickPick)
    disposables.push(
        quickPick.onDidAccept(() => {
            const item = quickPick.selectedItems.at(0)
            if (item?.annotation.url) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(item.annotation.url))
                quickPick.hide()
            }
        })
    )

    disposables.push(
        vscode.commands.registerCommand(
            COMMAND_ID,
            (group: string, annotations: AnnotationWithAdjustedRange<vscode.Range>[]): void => {
                quickPick.title = group
                quickPick.items = annotations.map(ann => ({
                    label: ann.title,
                    detail: ann.url,
                    annotation: ann,
                }))
                quickPick.show()
            }
        )
    )
    return {
        createCommandArgs(group, annotations) {
            return {
                command: COMMAND_ID,
                arguments: [group, annotations],
            }
        },
        dispose() {
            vscode.Disposable.from(...disposables).dispose()
        },
    }
}

function openWebBrowserCommandArgs(url: string): Pick<vscode.Command, 'command' | 'arguments'> {
    return {
        command: 'vscode.open',
        arguments: [vscode.Uri.parse(url)],
    }
}
