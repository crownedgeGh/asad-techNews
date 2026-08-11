import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { articles, pageViews } from '../../../db/schema';
import { and, desc, eq, gte, sql } from 'drizzle-orm';

const RANGE_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

function hostnameOf(referrer: string): string {
  try {
    return new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return referrer;
  }
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const rangeKey = url.searchParams.get('range') || '30d';
    const days = RANGE_DAYS[rangeKey] ?? 30;
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const [
      dailyRows,
      topArticleRows,
      deviceRows,
      referrerRows,
      [totalsRow],
      [siteStats],
    ] = await Promise.all([
      db
        .select({
          date: sql<string>`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`,
          count: sql<number>`count(*)::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(sql`1`)
        .orderBy(sql`1`),

      db
        .select({
          title: articles.title,
          slug: articles.slug,
          views: sql<number>`count(${pageViews.id})::int`,
        })
        .from(pageViews)
        .innerJoin(articles, eq(pageViews.articleId, articles.id))
        .where(gte(pageViews.createdAt, since))
        .groupBy(articles.id)
        .orderBy(desc(sql`count(${pageViews.id})`))
        .limit(5),

      db
        .select({
          device: sql<string>`coalesce(${pageViews.device}, 'unknown')`,
          count: sql<number>`count(*)::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(sql`1`),

      db
        .select({
          referrer: pageViews.referrer,
          count: sql<number>`count(*)::int`,
        })
        .from(pageViews)
        .where(and(gte(pageViews.createdAt, since)))
        .groupBy(pageViews.referrer)
        .orderBy(desc(sql`count(*)`))
        .limit(50),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since)),

      db.select({
        totalArticles: sql<number>`count(*)::int`,
        totalViews: sql<number>`coalesce(sum(${articles.views}), 0)::int`,
        totalLikes: sql<number>`coalesce(sum(${articles.likes}), 0)::int`,
        totalComments: sql<number>`coalesce(sum(${articles.commentsCount}), 0)::int`,
      }).from(articles),
    ]);

    // Fill in zero-count days so the trend chart has a continuous x-axis.
    const byDate = new Map(dailyRows.map((r) => [r.date, r.count]));
    const daily: { date: string; count: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      daily.push({ date: key, count: byDate.get(key) ?? 0 });
    }

    const referrerTotals = new Map<string, number>();
    for (const row of referrerRows) {
      const key = row.referrer ? hostnameOf(row.referrer) : 'Direct';
      referrerTotals.set(key, (referrerTotals.get(key) ?? 0) + row.count);
    }
    const topReferrers = [...referrerTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    return new Response(
      JSON.stringify({
        range: rangeKey,
        daily,
        topArticles: topArticleRows,
        deviceBreakdown: deviceRows,
        topReferrers,
        totalPageviews: totalsRow?.count ?? 0,
        site: siteStats,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('GET /api/admin/analytics error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
