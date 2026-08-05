'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import config from '@payload-config'
import { formatSlug } from '@/fields/slug/formatSlug'
import { getAdminUser } from './auth'

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

/** Mirrors what Payload's `json` field accepts. */
type JsonValue = string | number | boolean | { [k: string]: unknown } | unknown[] | null

export type ArticleInput = {
  title: string
  slug?: string
  excerpt?: string
  content: JsonValue
  category?: number | null
  author?: number | null
  coverImage?: number | null
  publishedAt?: string | null
  status: 'draft' | 'published'
}

const GENERIC_ERROR = 'Something went wrong. Please try again.'

/**
 * Every action resolves the caller itself rather than trusting the route guard —
 * a Server Action can be invoked directly without the (protected) layout ever
 * rendering. Combined with `overrideAccess: false`, the collection's access
 * config is a second, independent gate.
 */
async function withAdmin<T>(
  fn: (ctx: {
    payload: Awaited<ReturnType<typeof getPayload>>
    user: NonNullable<Awaited<ReturnType<typeof getAdminUser>>>
  }) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const user = await getAdminUser()
  if (!user) return { ok: false, error: 'You are not signed in.' }

  const payload = await getPayload({ config })
  try {
    return await fn({ payload, user })
  } catch (err) {
    return { ok: false, error: toSafeMessage(err) }
  }
}

/**
 * Payload's validation errors carry per-field detail worth surfacing; anything
 * else is reduced to a generic message so database internals, stack traces, and
 * connection strings never reach the browser.
 */
function toSafeMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { name?: string; message?: string; status?: number }
    if (e.name === 'ValidationError' && e.message) return e.message
    if (e.status === 403) return 'You do not have permission to do that.'
  }
  return GENERIC_ERROR
}

function extractFieldErrors(err: unknown): Record<string, string> | undefined {
  const data = (err as { data?: { errors?: { field?: string; message?: string }[] } })?.data
  if (!data?.errors?.length) return undefined
  const out: Record<string, string> = {}
  for (const e of data.errors) {
    if (e.field && e.message) out[e.field] = e.message
  }
  return Object.keys(out).length ? out : undefined
}

function revalidateAdmin(id?: number) {
  revalidatePath('/admin')
  revalidatePath('/admin/articles')
  if (id != null) {
    revalidatePath(`/admin/articles/${id}`)
    revalidatePath(`/admin/articles/${id}/edit`)
  }
}

const toData = (input: ArticleInput) => ({
  title: input.title,
  // Derived here so the payload always carries a slug. The collection's
  // beforeValidate hook still derives one independently, which is what covers
  // writes that do not come through this action (e.g. /cms).
  slug: input.slug?.trim() || formatSlug(input.title),
  excerpt: input.excerpt ?? undefined,
  content: input.content,
  category: input.category ?? undefined,
  author: input.author ?? undefined,
  coverImage: input.coverImage ?? undefined,
  publishedAt: input.publishedAt ?? undefined,
  _status: input.status,
})

export async function createArticle(input: ArticleInput): Promise<ActionResult<{ id: number }>> {
  return withAdmin(async ({ payload, user }) => {
    try {
      // Drafts are enabled on this collection, so the write path differs: draft
      // saves create a version, publishes write the live document. Payload's
      // types discriminate on a literal `draft`, hence the branch.
      const doc =
        input.status === 'draft'
          ? await payload.create({
              collection: 'articles',
              data: toData(input),
              draft: true,
              user,
              overrideAccess: false,
            })
          : await payload.create({
              collection: 'articles',
              data: toData(input),
              user,
              overrideAccess: false,
            })
      revalidateAdmin()
      return { ok: true, data: { id: doc.id as number } }
    } catch (err) {
      return { ok: false, error: toSafeMessage(err), fieldErrors: extractFieldErrors(err) }
    }
  })
}

export async function updateArticle(
  id: number,
  input: ArticleInput,
): Promise<ActionResult<{ id: number }>> {
  return withAdmin(async ({ payload, user }) => {
    try {
      if (input.status === 'draft') {
        await payload.update({
          collection: 'articles',
          id,
          data: toData(input),
          draft: true,
          user,
          overrideAccess: false,
        })
      } else {
        await payload.update({
          collection: 'articles',
          id,
          data: toData(input),
          user,
          overrideAccess: false,
        })
      }
      revalidateAdmin(id)
      return { ok: true, data: { id } }
    } catch (err) {
      return { ok: false, error: toSafeMessage(err), fieldErrors: extractFieldErrors(err) }
    }
  })
}

export async function deleteArticle(id: number): Promise<ActionResult> {
  return withAdmin(async ({ payload, user }) => {
    await payload.delete({ collection: 'articles', id, user, overrideAccess: false })
    revalidateAdmin(id)
    return { ok: true, data: undefined }
  })
}

export async function setArticleStatus(
  id: number,
  status: 'draft' | 'published',
): Promise<ActionResult> {
  return withAdmin(async ({ payload, user }) => {
    await payload.update({
      collection: 'articles',
      id,
      data: { _status: status },
      user,
      overrideAccess: false,
    })
    revalidateAdmin(id)
    return { ok: true, data: undefined }
  })
}

/**
 * Swap trend position with the adjacent article.
 *
 * Both writes happen in one transaction: a failure between them would leave two
 * articles sharing a `sortOrder`, which makes list ordering non-deterministic
 * and the next swap ambiguous.
 *
 * Moving the first article up, or the last down, is a successful no-op rather
 * than an error — the buttons are also disabled at the boundaries, so this is
 * defence in depth.
 */
export async function reorderArticle(
  id: number,
  direction: 'up' | 'down',
): Promise<ActionResult<{ moved: boolean }>> {
  return withAdmin<{ moved: boolean }>(async ({ payload, user }) => {
    const current = await payload.findByID({
      collection: 'articles',
      id,
      user,
      overrideAccess: false,
      depth: 0,
    })

    const currentOrder = (current.sortOrder ?? 0) as number

    const { docs: neighbours } = await payload.find({
      collection: 'articles',
      where:
        direction === 'up'
          ? { sortOrder: { less_than: currentOrder } }
          : { sortOrder: { greater_than: currentOrder } },
      sort: direction === 'up' ? '-sortOrder' : 'sortOrder',
      limit: 1,
      depth: 0,
      user,
      overrideAccess: false,
    })

    const neighbour = neighbours[0]
    if (!neighbour) return { ok: true, data: { moved: false } }

    const neighbourOrder = (neighbour.sortOrder ?? 0) as number

    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      return { ok: false, error: GENERIC_ERROR }
    }

    try {
      await payload.update({
        collection: 'articles',
        id,
        data: { sortOrder: neighbourOrder },
        req: { transactionID } as never,
        user,
        overrideAccess: false,
      })
      await payload.update({
        collection: 'articles',
        id: neighbour.id,
        data: { sortOrder: currentOrder },
        req: { transactionID } as never,
        user,
        overrideAccess: false,
      })
      await payload.db.commitTransaction(transactionID)
    } catch (err) {
      await payload.db.rollbackTransaction(transactionID)
      return { ok: false, error: toSafeMessage(err) }
    }

    revalidateAdmin(id)
    return { ok: true, data: { moved: true } }
  })
}
