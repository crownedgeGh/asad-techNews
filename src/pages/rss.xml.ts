import type { APIRoute } from 'astro';
import { db } from '../db';
import { articles, users } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { SITE, SITE_URL, articleUrl, absoluteUrl } from '../lib/seo';
import { excerptFromContent } from '../lib/format';
import { escapeXml, xmlResponse } from '../lib/xml';

export const prerender = false;

/** RSS 2.0 feed of the latest published articles. */
export const GET: APIRoute = async () => {
  let rows: {
    slug: string;
    title: string;
    content: string;
    category: string;
    coverImage: string | null;
    createdAt: Date;
    authorName: string | null;
  }[] = [];
  try {
    rows = await db
      .select({
        slug: articles.slug,
        title: articles.title,
        content: articles.content,
        category: articles.category,
        coverImage: articles.coverImage,
        createdAt: articles.createdAt,
        authorName: users.name,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.published, true))
      .orderBy(desc(articles.createdAt))
      .limit(30);
  } catch (e) {
    console.error('rss: query failed', e);
  }

  const items = rows
    .map((a) => {
      const link = articleUrl(a.slug);
      const desc = excerptFromContent(a.content, 300);
      const enclosure = a.coverImage
        ? `\n      <enclosure url="${escapeXml(absoluteUrl(a.coverImage))}" type="image/webp" />`
        : '';
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(a.createdAt).toUTCString()}</pubDate>
      <category>${escapeXml(a.category)}</category>
      ${a.authorName ? `<dc:creator>${escapeXml(a.authorName)}</dc:creator>` : ''}
      <description>${escapeXml(desc)}</description>${enclosure}
    </item>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return xmlResponse(body, 1800);
};
