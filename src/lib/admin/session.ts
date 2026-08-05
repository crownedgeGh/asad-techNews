'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'
import { isAdminRole } from './auth'

export type LoginState = { error?: string }

// `cookiePrefix` is optional on the config type; Payload's default is 'payload'.
const tokenCookieName = (prefix?: string) => `${prefix ?? 'payload'}-token`

// Deliberately identical for "no such user", "wrong password", and "role not
// permitted" — the form must not reveal which email addresses exist.
const GENERIC_ERROR = 'Those credentials are not valid.'

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: GENERIC_ERROR }

  const payload = await getPayload({ config })

  let token: string | undefined
  let role: unknown

  try {
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })
    token = result.token
    role = result.user?.role
  } catch {
    return { error: GENERIC_ERROR }
  }

  if (!token) return { error: GENERIC_ERROR }

  // An authenticated user without an editorial role gets no session cookie at
  // all, so a non-editorial account cannot sit half-logged-in.
  if (!isAdminRole(role)) return { error: GENERIC_ERROR }

  const cookieStore = await cookies()
  cookieStore.set({
    name: tokenCookieName(payload.config.cookiePrefix),
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  cookieStore.delete(tokenCookieName(payload.config.cookiePrefix))
  redirect('/admin/login')
}
