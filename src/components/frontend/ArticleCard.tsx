import Link from 'next/link'
import Image from 'next/image'

import type { Article } from '@/payload-types'

export function ArticleCard({ article }: { article: Article }) {
  const cover = typeof article.coverImage === 'object' ? article.coverImage : null
  const category = typeof article.category === 'object' ? article.category : null

  return (
    <Link
      href={`/article/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? article.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400 dark:text-neutral-600">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {category ? (
          <span className="w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {category.title}
          </span>
        ) : null}

        <h3 className="font-sans text-lg font-bold leading-snug text-neutral-900 group-hover:text-blue-600 dark:text-neutral-50 dark:group-hover:text-blue-400">
          {article.title}
        </h3>

        {article.excerpt ? (
          <p className="line-clamp-2 font-serif text-sm text-neutral-600 dark:text-neutral-400">
            {article.excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-neutral-400 dark:text-neutral-500">
          <span>{article.views ?? 0} views</span>
          <span>&middot;</span>
          <span>{article.likes ?? 0} likes</span>
        </div>
      </div>
    </Link>
  )
}
