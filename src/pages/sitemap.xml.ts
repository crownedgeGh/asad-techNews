import type { APIRoute } from 'astro';
import { db } from '../db';
import { articles } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { SITE_URL } from '../lib/seo';
import { xmlResponse } from '../lib/xml';

export const prerender = false;

/**
 * Sitemap index. Points crawlers at the static-pages sitemap, the article
 * sitemap (with image extensions), and the Google News sitemap.
 */
export const GET: APIRoute = async () => {
  let lastMod = new Date().toISOString();
  try {
    const latest = await db
      .select({ updatedAt: articles.updatedAt })
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.updatedAt))
      .limit(1);
    if (latest[0]?.updatedAt) lastMod = new Date(latest[0].updatedAt).toISOString();
  } catch (e) {
    console.error('sitemap index: failed to read latest article', e);
  }

  const maps = [
    { loc: `${SITE_URL}/sitemap-pages.xml`, lastmod: lastMod },
    { loc: `${SITE_URL}/sitemap-articles.xml`, lastmod: lastMod },
    { loc: `${SITE_URL}/news-sitemap.xml`, lastmod: lastMod },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${maps
  .map((m) => `  <sitemap>\n    <loc>${m.loc}</loc>\n    <lastmod>${m.lastmod}</lastmod>\n  </sitemap>`)
  .join('\n')}
</sitemapindex>`;

  return xmlResponse(body);
};
