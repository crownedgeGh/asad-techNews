import type { APIRoute } from 'astro';
import { db } from '../db';
import { articles } from '../db/schema';
import { and, eq, gte, desc } from 'drizzle-orm';
import { SITE, articleUrl } from '../lib/seo';
import { escapeXml, xmlResponse } from '../lib/xml';

export const prerender = false;

/**
 * Google News sitemap. Per Google's guidelines it lists only articles
 * published in the last 48 hours. Refreshed frequently for fast news indexing.
 */
export const GET: APIRoute = async () => {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  let rows: { slug: string; title: string; createdAt: Date }[] = [];
  try {
    rows = await db
      .select({ slug: articles.slug, title: articles.title, createdAt: articles.createdAt })
      .from(articles)
      .where(and(eq(articles.published, true), gte(articles.createdAt, twoDaysAgo)))
      .orderBy(desc(articles.createdAt))
      .limit(1000);
  } catch (e) {
    console.error('news sitemap: query failed', e);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${rows
  .map(
    (a) =>
      `  <url>\n    <loc>${escapeXml(articleUrl(a.slug))}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${escapeXml(SITE.name)}</news:name>\n        <news:language>en</news:language>\n      </news:publication>\n      <news:publication_date>${new Date(a.createdAt).toISOString()}</news:publication_date>\n      <news:title>${escapeXml(a.title)}</news:title>\n    </news:news>\n  </url>`,
  )
  .join('\n')}
</urlset>`;

  // Shorter cache — news must surface fast.
  return xmlResponse(body, 600);
};
