import clsx from 'clsx'
import { CornerRightDownIcon } from 'lucide-react'
import { type FunctionComponent } from 'react'
import { Link } from '../../src/components/Link.tsx'
import { Button } from '../../src/components/ui/button.tsx'
import { LogotextHorizColorImage } from '../../src/layout/logo.tsx'
import { FakeEditorWindow } from '../playground/FakeEditorWindow.tsx'

export const Page: FunctionComponent = () => (
    <>
        <div className="flex flex-col items-center pt-6">
            <h1 className="relative">
                <LogotextHorizColorImage size="lg" />
                <span className="absolute right-[5px] top-[-4px] bg-destructive px-1 py-0 font-mono text-[75%] font-semibold leading-normal text-destructive-foreground">
                    alpha
                </span>
                <span className="sr-only">OpenCtx</span>
            </h1>

            <p className="mt-4 max-w-lg text-center text-lg">
                See contextual info about code from your dev tools, in your editor and anywhere else you read code.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button variant="default" size="lg" asChild={true}>
                    <Link href="/docs/start">Get started</Link>
                </Button>
            </div>

            <IntegrationsSection className="mt-12" />
        </div>
        <p className="mt-12 flex items-start justify-center gap-2 text-muted-foreground md:text-xl">
            <span className="italic">How it looks in your editor</span> <CornerRightDownIcon size={48} />
        </p>
        <FakeEditorWindow className="mb-4 mt-2" />
        <p className="mb-16 text-center text-sm italic text-muted-foreground">
            (Don't worry. It doesn't actually blink yellow in your editor, and you can easily hide the annotations when
            you don't want them.)
        </p>
    </>
)

interface IntegrationItem {
    name: string
    type: 'client' | 'provider'
    slug: string
}

const INTEGRATIONS: IntegrationItem[] = [
    { name: 'VS Code', type: 'client', slug: 'vscode' },
    { name: 'Browser ext', type: 'client', slug: 'browser-extension' },
    { name: 'GitHub', type: 'client', slug: 'github' },
    { name: 'Sourcegraph', type: 'client', slug: 'sourcegraph' },
    { name: 'Cody', type: 'client', slug: 'cody' },
    { name: 'Monaco Editor', type: 'client', slug: 'monaco-editor' },
    { name: 'CodeMirror', type: 'client', slug: 'codemirror' },
    { name: 'Storybook', type: 'provider', slug: 'storybook' },
    { name: 'Prometheus', type: 'provider', slug: 'prometheus' },
    { name: 'Links', type: 'provider', slug: 'links' },
]

const IntegrationsSection: FunctionComponent<{ className?: string }> = ({ className }) => {
    const clients = INTEGRATIONS.filter(({ type }) => type === 'client')
    const providers = INTEGRATIONS.filter(({ type }) => type === 'provider')

    return (
        <section className={clsx('flex flex-col items-start gap-3', className)}>
            <IntegrationsList title="Editors & clients" type="client" items={clients} />
            <IntegrationsList title="Providers" type="provider" items={providers} />
        </section>
    )
}

const IntegrationsList: FunctionComponent<{
    title: string
    type: IntegrationItem['type']
    items: IntegrationItem[]
    className?: string
}> = ({ title, type, items, className }) => (
    <div className={clsx('flex flex-wrap items-start gap-4 sm:flex-nowrap', className)}>
        <h2 className="mt-[7px] shrink-0 whitespace-nowrap text-right text-xs sm:w-[120px] lg:text-sm">
            <Link
                href={`/${type}`}
                className="font-bold text-foreground no-underline underline-offset-4 hover:underline"
            >
                {title}
            </Link>
        </h2>
        <ul className="flex flex-wrap items-center gap-2">
            {items.map(item => (
                <li key={`${item.type}:${item.slug}`}>
                    <Button asChild={true} variant="outlineLink" size="xs">
                        <Link href={`/docs/${item.type}s/${item.slug}`} className="block">
                            {item.name}
                        </Link>
                    </Button>
                </li>
            ))}
            <li className="">
                <span className="text-xs text-muted-foreground lg:text-sm">More coming soon...</span>
            </li>
        </ul>
    </div>
)
