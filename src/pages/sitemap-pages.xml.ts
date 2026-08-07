import type { APIRoute } from 'astro';
import { SITE_URL, NAV_SECTIONS } from '../lib/seo';
import { xmlResponse } from '../lib/xml';

export const prerender = false;

/** Static/listing pages sitemap. */
export const GET: APIRoute = () => {
  const now = new Date().toISOString();

  // Listing/nav pages (priority weighted: home highest, sections high).
  const listing = NAV_SECTIONS.map((s) => ({
    loc: `${SITE_URL}${s.href === '/' ? '' : s.href}`,
    changefreq: s.href === '/' ? 'hourly' : 'daily',
    priority: s.href === '/' ? '1.0' : '0.8',
  }));

  // Evergreen informational pages.
  const staticPages = ['/about', '/contact', '/editorial-policy', '/privacy', '/terms', '/search'].map((p) => ({
    loc: `${SITE_URL}${p}`,
    changefreq: 'monthly',
    priority: '0.3',
  }));

  const urls = [...listing, ...staticPages];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>`;

  return xmlResponse(body);
};
