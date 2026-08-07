import type { APIRoute } from 'astro';
import { db } from '../db';
import { articles } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { SITE_URL, articleUrl, absoluteUrl } from '../lib/seo';
import { escapeXml, xmlResponse } from '../lib/xml';

export const prerender = false;

/**
 * Article sitemap with embedded Image sitemap extension — every article URL
 * carries its cover image so Google Images can index it.
 */
export const GET: APIRoute = async () => {
  let rows: { slug: string; title: string; coverImage: string | null; updatedAt: Date; createdAt: Date }[] = [];
  try {
    rows = await db
      .select({
        slug: articles.slug,
        title: articles.title,
        coverImage: articles.coverImage,
        updatedAt: articles.updatedAt,
        createdAt: articles.createdAt,
      })
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.updatedAt))
      .limit(5000);
  } catch (e) {
    console.error('article sitemap: query failed', e);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${rows
  .map((a) => {
    const loc = articleUrl(a.slug);
    const lastmod = new Date(a.updatedAt || a.createdAt).toISOString();
    const img = a.coverImage
      ? `\n    <image:image>\n      <image:loc>${escapeXml(absoluteUrl(a.coverImage))}</image:loc>\n      <image:title>${escapeXml(a.title)}</image:title>\n    </image:image>`
      : '';
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>${img}\n  </url>`;
  })
  .join('\n')}
</urlset>`;

  return xmlResponse(body);
};
