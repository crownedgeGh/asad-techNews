import type { AstroCookies } from 'astro';

// Hardcoded admin credentials — single shared admin account, no user table involved.
export const ADMIN_ID = 'adminlumen';
export const ADMIN_PASSWORD = 'lumen0909';

export const SESSION_COOKIE_NAME = 'lumen_admin_session';
// Static session token checked against the cookie value. Fine here since the
// credentials themselves are hardcoded — there's no per-user secret to protect.
const SESSION_TOKEN = 'lumen-admin-authenticated-v1';

export function isAdminAuthenticated(cookies: AstroCookies): boolean {
  return cookies.get(SESSION_COOKIE_NAME)?.value === SESSION_TOKEN;
}

export function setAdminSession(cookies: AstroCookies) {
  cookies.set(SESSION_COOKIE_NAME, SESSION_TOKEN, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAdminSession(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}
