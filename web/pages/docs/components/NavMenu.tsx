import clsx from 'clsx'
import { ExternalLink } from 'lucide-react'
import { useMemo, type FunctionComponent } from 'react'
import { Link } from '../../../src/components/Link.tsx'
import { type ContentPageInfo } from '../../../src/content/contentPages.ts'

export const NavMenu: FunctionComponent<{
    contentPageInfos: ContentPageInfo[]
    sheet?: boolean
    className?: string
}> = ({ contentPageInfos, className }) => {
    const pageGroups = useMemo(() => groupContentPages(contentPageInfos), [contentPageInfos])
    return (
        <nav className={clsx('overflow-y-auto', className)}>
            {pageGroups.map(({ title, pages }) => (
                <section key={title} className="mt-6">
                    <h2 className="mb-8 text-sm font-semibold lg:mb-3">{title}</h2>
                    <ul className="space-y-6 border-l border-muted lg:space-y-2">
                        {pages.map(({ slug, title }) => (
                            <li key={slug} className="text-sm">
                                <Link
                                    href={`/docs/${slug}`}
                                    className="-ml-px block border-l border-transparent pl-4 no-underline hover:border-border hover:text-foreground-em"
                                    activeClassName="font-semibold text-primary hover:text-primary !border-primary hover:border-primary"
                                >
                                    {title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
            <Link
                href="https://github.com/sourcegraph/openctx"
                target="_blank"
                className="mt-6 flex items-center gap-2 text-sm font-semibold no-underline hover:underline"
            >
                GitHub <ExternalLink size={16} />
            </Link>
        </nav>
    )
}

const GROUPS: Omit<PageGroup, 'pages'>[] = [
    { group: 'doc', title: 'Documentation' },
    { group: 'clients', title: 'Clients' },
    { group: 'providers', title: 'Providers' },
    { group: 'dev', title: 'Development' },
]

interface PageGroup {
    group: string
    title: string
    pages: ContentPageInfo[]
}

function groupContentPages(infos: ContentPageInfo[]): PageGroup[] {
    const pageGroups: PageGroup[] = GROUPS.map(group => ({ ...group, pages: [] }))
    for (const info of infos) {
        if (!info.group) {
            throw new Error(`page ${info.slug} has no 'group' in its 'info' export`)
        }
        const group = pageGroups.find(({ group }) => group === info.group)
        if (!group) {
            throw new Error(`group not found: ${info.group}`)
        }
        group.pages.push(info)
    }

    for (const pageGroup of pageGroups) {
        pageGroup.pages.sort((a, b) => {
            const ao = a.order ?? 100
            const bo = b.order ?? 100
            if (ao - bo !== 0) {
                return ao - bo
            }
            return a.title.localeCompare(b.title)
        })
    }

    return pageGroups
}
