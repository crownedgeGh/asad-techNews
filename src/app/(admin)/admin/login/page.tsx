import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/admin/LoginForm'
import { getAdminUser } from '@/lib/admin/auth'

// Kept in sync with the seeder in payload.config.ts. Prefilled in development
// only, and always as an explicit affordance — never an automatic bypass.
const DEV_ADMIN_EMAIL = 'dev@lumen.tech'
const DEV_ADMIN_PASSWORD = 'dev12345'

export default async function LoginPage() {
  // Already signed in — no reason to show the form again.
  const user = await getAdminUser()
  if (user) redirect('/admin')

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-extrabold tracking-tight">The Lumen Tech</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to the editorial admin
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <LoginForm
            devEmail={isDev ? DEV_ADMIN_EMAIL : undefined}
            devPassword={isDev ? DEV_ADMIN_PASSWORD : undefined}
          />
        </div>

        {isDev ? (
          <p className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Development only: seeded credentials are prefilled. Submit the form to sign in.
          </p>
        ) : null}
      </div>
    </main>
  )
}
