import { MDXProvider } from '@mdx-js/react'
import clsx from 'clsx'
import { ExternalLinkIcon } from 'lucide-react'
import { StrictMode, type FunctionComponent, type ReactNode } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { MDX_COMPONENTS } from '../components/content/MdxComponents.tsx'
import { Link } from '../components/Link.tsx'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '../components/ui/navigation-menu.tsx'
import '../globals.css'
import { normalLayoutClassName } from './config.ts'
import { LogotextHorizColorImage } from './logo.tsx'

export interface PageContextForLayout {
    layoutClassName?: 'wide'
}

export const Layout: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
    const pageContext = usePageContext()
    return (
        <StrictMode>
            <MDXProvider components={MDX_COMPONENTS}>
                <header className="sticky top-0 z-10 border-b border-border bg-background">
                    <NavMenu className="mx-auto flex max-w-screen-lg items-center justify-between gap-4 py-2" />
                </header>
                <main
                    className={clsx(
                        'md:min-h-[80vh]',
                        pageContext.config.layoutClassName === 'wide' ? '' : normalLayoutClassName
                    )}
                >
                    {children}
                </main>
                <footer className="mt-6 border-t border-border">
                    <p className="mx-auto max-w-screen-lg px-6 py-3 text-xs text-muted-foreground">
                        Maintained by <Link href="https://sourcegraph.com">Sourcegraph</Link>. Licensed under Apache
                        2.0.
                    </p>
                </footer>
            </MDXProvider>
        </StrictMode>
    )
}

const NavMenu: React.FunctionComponent<{ className?: string }> = ({ className }) => (
    <NavigationMenu className={className}>
        <NavigationMenuList className="flex flex-wrap justify-start">
            <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild={true}>
                    <Link href="/" className="relative no-underline">
                        <LogotextHorizColorImage />
                        <span className="absolute right-[-10px] top-[-3px] bg-destructive px-1 py-0 font-mono text-[75%] font-semibold leading-normal text-destructive-foreground">
                            alpha
                        </span>
                    </Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild={true}>
                    <Link href="/docs" className="no-underline" activeClassName="!bg-secondary/50">
                        Docs
                    </Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild={true}>
                    <Link href="/playground" className="no-underline" activeClassName="!bg-secondary/50">
                        Playground
                    </Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild={true}>
                    <Link
                        href="https://github.com/sourcegraph/openctx"
                        target="_blank"
                        className="flex items-center gap-2 no-underline"
                    >
                        Code
                        <span className="text-muted-foreground">
                            <ExternalLinkIcon size={16} />
                        </span>
                    </Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
)
