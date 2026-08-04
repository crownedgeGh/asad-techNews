import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@payload-config'
import type { Article } from '@/payload-types'
import { ArticleCard } from '@/components/frontend/ArticleCard'

export default async function HomePage() {
  let articles: Article[] = []
  let dbUnavailable = false

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'articles',
      where: {
        _status: { equals: 'published' },
      },
      sort: 'sortOrder',
      limit: 15,
      depth: 1,
    })
    articles = result.docs
  } catch {
    dbUnavailable = true
  }

  const [featured, ...rest] = articles

  return (
    <main>
      <section className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h1 className="max-w-2xl font-sans text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Tech news, AI tools &amp; reviews — sharply written.
          </h1>
          <p className="mt-4 max-w-xl font-serif text-lg text-neutral-600 dark:text-neutral-400">
            The Lumen Tech covers what&apos;s shipping, what&apos;s worth trying, and what&apos;s
            just noise.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {dbUnavailable ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
            <p className="font-serif text-neutral-500 dark:text-neutral-400">
              Database not connected yet — set a real <code>DATABASE_URL</code> in{' '}
              <code>.env</code> to load articles.
            </p>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
            <p className="font-serif text-neutral-500 dark:text-neutral-400">No articles yet.</p>
            <Link
              href="/admin/collections/articles/create"
              className="mt-4 inline-block rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create the first one
            </Link>
          </div>
        ) : (
          <>
            {featured ? (
              <div className="mb-10">
                <ArticleCard article={featured} />
              </div>
            ) : null}

            {rest.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  )
}
