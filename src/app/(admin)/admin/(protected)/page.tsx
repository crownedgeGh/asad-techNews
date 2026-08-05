import Link from 'next/link'
import { Eye, FileText, Heart, MessageSquare, PencilLine } from 'lucide-react'
import { getPayload } from 'payload'

import config from '@payload-config'
import { StatCard } from '@/components/admin/StatCard'
import { requireAdminUser } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

const relativeTime = (iso?: string | null) => {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function DashboardPage() {
  const user = await requireAdminUser()
  const payload = await getPayload({ config })

  // Totals must span the whole collection, not one page of results. Fine at
  // current volume; revisit with SQL aggregates past a few thousand articles.
  const all = await payload.find({
    collection: 'articles',
    limit: 0,
    pagination: false,
    depth: 0,
    user,
    overrideAccess: false,
  })

  const totals = all.docs.reduce(
    (acc, a) => ({
      views: acc.views + (a.views ?? 0),
      likes: acc.likes + (a.likes ?? 0),
      comments: acc.comments + (a.commentsCount ?? 0),
      drafts: acc.drafts + (a._status === 'draft' ? 1 : 0),
    }),
    { views: 0, likes: 0, comments: 0, drafts: 0 },
  )

  const recent = await payload.find({
    collection: 'articles',
    sort: '-updatedAt',
    limit: 5,
    depth: 1,
    user,
    overrideAccess: false,
  })

  const isEmpty = all.docs.length === 0

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-xl font-extrabold tracking-tight">Dashboard</h1>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Articles" value={all.docs.length} icon={FileText} />
        <StatCard label="Drafts" value={totals.drafts} icon={PencilLine} />
        <StatCard label="Views" value={totals.views} icon={Eye} />
        <StatCard label="Likes" value={totals.likes} icon={Heart} />
        <StatCard label="Comments" value={totals.comments} icon={MessageSquare} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Recent activity
        </h2>

        {isEmpty ? (
          <div className="mt-3 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              No articles yet. The publication starts here.
            </p>
            <Link
              href="/admin/articles/new"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Write the first article
            </Link>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {recent.docs.map((article) => {
              const category = typeof article.category === 'object' ? article.category : null
              const published = article._status === 'published'
              return (
                <li key={article.id}>
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {article.title}
                    </span>
                    {category ? (
                      <span className="hidden shrink-0 text-xs text-neutral-500 sm:inline dark:text-neutral-400">
                        {category.title}
                      </span>
                    ) : null}
                    <span
                      className={[
                        'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                        published
                          ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                      ].join(' ')}
                    >
                      {published ? 'Published' : 'Draft'}
                    </span>
                    <span className="w-20 shrink-0 text-right text-xs text-neutral-500 dark:text-neutral-400">
                      {relativeTime(article.updatedAt)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
