import type { APIRoute } from 'astro';
import { db } from '../../db';
import { articles, pageViews } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const prerender = false;

const DEVICES = new Set(['mobile', 'tablet', 'desktop']);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const path = typeof body.path === 'string' ? body.path.slice(0, 512) : null;
    if (!path) {
      return new Response(JSON.stringify({ error: 'path is required' }), { status: 400 });
    }
    const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 512) : null;
    const device = DEVICES.has(body.device) ? body.device : null;

    let articleId: number | null = null;
    const slugMatch = path.match(/^\/article\/([^/]+)\/?$/);
    if (slugMatch) {
      const [row] = await db
        .select({ id: articles.id })
        .from(articles)
        .where(eq(articles.slug, slugMatch[1]))
        .limit(1);
      articleId = row?.id ?? null;
    }

    await db.insert(pageViews).values({ path, articleId, referrer, device });

    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/track error:', err);
    // Never let tracking failures surface to the visitor.
    return new Response(JSON.stringify({ ok: false }), { status: 200 });
  }
};
