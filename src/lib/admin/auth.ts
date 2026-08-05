import { cookies as nextCookies, headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'
import type { User } from '@/payload-types'

export const ADMIN_ROLES = ['admin', 'editor'] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

export const isAdminRole = (role: unknown): role is AdminRole =>
  typeof role === 'string' && (ADMIN_ROLES as readonly string[]).includes(role)

/**
 * Resolve the current user from Payload's session cookie.
 *
 * Returns null when there is no session, when the token is invalid or expired,
 * or when the user's role is not an editorial one. Payload validates the token
 * itself — we never treat the mere presence of a cookie as authentication.
 */
export async function getAdminUser(): Promise<User | null> {
  const payload = await getPayload({ config })

  // Payload's dev-only `autoLogin` injects a user into `payload.auth()` with no
  // session cookie present. That is a convenience for Payload's own admin, but
  // it would silently bypass sign-in here — so require that a real session
  // token exists before accepting the result. This narrows the check only;
  // Payload still validates the token, and we never treat a cookie's mere
  // presence as proof of anything.
  const cookieStore = await nextCookies()
  const tokenName = `${payload.config.cookiePrefix ?? 'payload'}-token`
  if (!cookieStore.get(tokenName)?.value) return null

  try {
    const { user } = await payload.auth({ headers: await nextHeaders() })
    if (!user || !isAdminRole(user.role)) return null
    return user as User
  } catch {
    return null
  }
}

/**
 * Require an authenticated editorial user, redirecting to the login page if
 * there isn't one.
 *
 * Called from the (admin) layout so every route is gated, AND independently
 * from every Server Action — a layout guard does not protect an action invoked
 * directly.
 */
export async function requireAdminUser(): Promise<User> {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')
  return user
}

/** True when the user may delete articles. Mirrors the collection's access config. */
export const canDelete = (user: User): boolean => user.role === 'admin'
