'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ExternalLink,
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Users,
} from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/articles', label: 'Articles', icon: FileText, exact: false },
]

// Collections the custom admin deliberately does not manage. See design
// non-goals: these stay in Payload's native admin.
const CMS_LINKS = [
  { href: '/cms/collections/media', label: 'Media', icon: ImageIcon },
  { href: '/cms/collections/categories', label: 'Categories', icon: FolderTree },
  { href: '/cms/collections/comments', label: 'Comments', icon: MessageSquare },
  { href: '/cms/collections/users', label: 'Users', icon: Users },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin" className="flex h-full flex-col gap-8 p-4">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="px-2 text-sm font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100"
      >
        The Lumen Tech
        <span className="ml-1.5 font-medium text-neutral-500 dark:text-neutral-400">Admin</span>
      </Link>

      <ul className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  // Active state is carried by weight and a left rule as well as
                  // colour, so it does not depend on colour perception alone.
                  active
                    ? 'border-l-2 border-blue-600 bg-blue-50 pl-[10px] font-semibold text-blue-700 dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-300'
                    : 'font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800',
                ].join(' ')}
              >
                <Icon aria-hidden className="size-4 shrink-0" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-1">
        <h2 className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Manage in CMS
        </h2>
        <ul className="flex flex-col gap-1">
          {CMS_LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <Icon aria-hidden className="size-4 shrink-0" />
                {label}
                <ExternalLink
                  aria-label="(opens Payload CMS)"
                  className="ml-auto size-3.5 text-neutral-400 dark:text-neutral-500"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
