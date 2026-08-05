import React from 'react'

import { AdminShell } from '@/components/admin/AdminShell'
import { ToastProvider } from '@/components/admin/Toast'
import { requireAdminUser } from '@/lib/admin/auth'
import { logoutAction } from '@/lib/admin/session'

/**
 * Gates every admin route except /admin/login, which sits outside this group.
 *
 * This is the route-level guard. It is NOT the only one: each Server Action
 * re-checks independently, because an action can be invoked directly without
 * ever rendering this layout.
 */
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser()

  return (
    <ToastProvider>
      <AdminShell userLabel={user.name || user.email} logoutAction={logoutAction}>
        {children}
      </AdminShell>
    </ToastProvider>
  )
}
