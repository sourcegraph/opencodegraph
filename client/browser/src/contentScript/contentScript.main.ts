import '../shared/polyfills'
// ^^ import polyfills first
import { type Annotation } from '@openctx/client'
import { type AnnotationsParams } from '@openctx/provider'
import deepEqual from 'deep-equal'
import { combineLatest, distinctUntilChanged, mergeMap, throttleTime, type Observable } from 'rxjs'
import { background } from '../browser-extension/web-extension-api/runtime'
import './contentScript.main.css'
import { debugTap } from './debug'
import { injectOnGitHubCodeView } from './github/codeView'
import { injectOnGitHubPullRequestFilesView } from './github/pullRequestFilesView'
import { locationChanges } from './locationChanges'

/**
 * A function called to inject OpenCtx features on a page. They should just return an empty
 * Observable if they are not intended for the current page.
 */
type Injector = (location: URL, annotationsChanges_: typeof annotationsChanges) => Observable<void>

const INJECTORS: Injector[] = [injectOnGitHubCodeView, injectOnGitHubPullRequestFilesView]

const subscription = locationChanges
    .pipe(mergeMap(location => combineLatest(INJECTORS.map(injector => injector(location, annotationsChanges)))))
    .subscribe()
window.addEventListener('unload', () => subscription.unsubscribe())

function annotationsChanges(params: AnnotationsParams): Observable<Annotation[]> {
    return background.annotationsChanges(params).pipe(
        distinctUntilChanged((a, b) => deepEqual(a, b)),
        throttleTime(200, undefined, { leading: true, trailing: true }),
        debugTap(annotations => {
            console.groupCollapsed('annotationsChanges')
            console.count('annotationsChanges count')
            console.log(annotations)
            console.groupEnd()
        })
    )
}
