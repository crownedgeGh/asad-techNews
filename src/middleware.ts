import { defineMiddleware } from 'astro:middleware';
import { isAdminAuthenticated } from './lib/adminAuth';

const PUBLIC_ADMIN_PAGES = ['/admin/login'];
const PUBLIC_ADMIN_API = ['/api/admin/login'];

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  const isAdminPage = pathname.startsWith('/admin') && !PUBLIC_ADMIN_PAGES.includes(pathname);
  const isAdminApi = pathname.startsWith('/api/admin') && !PUBLIC_ADMIN_API.includes(pathname);

  if ((isAdminPage || isAdminApi) && !isAdminAuthenticated(context.cookies)) {
    if (isAdminApi) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const redirectUrl = new URL('/admin/login', context.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return context.redirect(redirectUrl.pathname + redirectUrl.search);
  }

  return next();
});
