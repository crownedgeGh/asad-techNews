import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'

import config from '@payload-config'

type Args = {
  params: Promise<{ slug: string }>
}

export default async function ArticlePage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const article = docs[0]
  if (!article) notFound()

  const category = typeof article.category === 'object' ? article.category : null

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {category ? (
        <span className="mb-4 inline-block w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {category.title}
        </span>
      ) : null}
      <h1 className="mb-4 font-sans text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        {article.title}
      </h1>
      {article.excerpt ? (
        <p className="mb-8 font-serif text-lg text-neutral-600 dark:text-neutral-400">
          {article.excerpt}
        </p>
      ) : null}
      <div className="prose dark:prose-invert prose-neutral max-w-none font-serif">
        <RichText data={article.content} />
      </div>
    </main>
  )
}
