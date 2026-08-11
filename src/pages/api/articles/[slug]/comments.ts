import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { db } from '../../../../db';
import { articles, comments } from '../../../../db/schema';
import { eq, desc, sql } from 'drizzle-orm';

const NAME_MAX_LEN = 60;
const BODY_MAX_LEN = 2000;
const RATE_LIMIT_SECONDS = 20;

function hashIp(ip: string) {
  return createHash('sha256').update(ip).digest('hex');
}

function getClientIp(context: { request: Request; clientAddress?: string }) {
  const forwarded = context.request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  try {
    return context.clientAddress ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    const slug = params.slug;
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
    }

    const articleRows = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, slug));
    const article = articleRows[0];
    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), { status: 404 });
    }

    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.articleId, article.id))
      .orderBy(desc(comments.createdAt));

    const result = rows.map((c) => ({
      id: c.id,
      name: c.name,
      body: c.body,
      upvotes: c.upvotes,
      createdAt: c.createdAt,
      upvoted: cookies.get(`upvoted_${c.id}`)?.value === '1',
    }));

    return new Response(JSON.stringify({ comments: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /api/articles/[slug]/comments error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

export const POST: APIRoute = async (context) => {
  try {
    const { params, request } = context;
    const slug = params.slug;
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
    }

    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload.body !== 'string') {
      return new Response(JSON.stringify({ error: 'Comment body is required' }), { status: 400 });
    }

    // Honeypot: a hidden field real users never fill in. Bots that fill every
    // field get a fake success so they don't learn to skip it.
    if (typeof payload.website === 'string' && payload.website.trim() !== '') {
      return new Response(JSON.stringify({ id: 0, name: null, body: '', upvotes: 0, createdAt: new Date().toISOString(), upvoted: false }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = payload.body.trim().slice(0, BODY_MAX_LEN);
    if (body.length < 2) {
      return new Response(JSON.stringify({ error: 'Comment is too short' }), { status: 400 });
    }
    const rawName = typeof payload.name === 'string' ? payload.name.trim().slice(0, NAME_MAX_LEN) : '';
    const name = rawName || null;

    const articleRows = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, slug));
    const article = articleRows[0];
    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), { status: 404 });
    }

    const ipHash = hashIp(getClientIp(context));
    const recent = await db
      .select({ createdAt: comments.createdAt })
      .from(comments)
      .where(eq(comments.ipHash, ipHash))
      .orderBy(desc(comments.createdAt))
      .limit(1);
    if (recent[0] && Date.now() - new Date(recent[0].createdAt).getTime() < RATE_LIMIT_SECONDS * 1000) {
      return new Response(JSON.stringify({ error: 'You are commenting too fast. Please wait a moment.' }), {
        status: 429,
      });
    }

    const inserted = await db
      .insert(comments)
      .values({ articleId: article.id, name, body, ipHash })
      .returning();

    await db
      .update(articles)
      .set({ commentsCount: sql`${articles.commentsCount} + 1` })
      .where(eq(articles.id, article.id));

    const c = inserted[0];
    return new Response(
      JSON.stringify({ id: c.id, name: c.name, body: c.body, upvotes: c.upvotes, createdAt: c.createdAt, upvoted: false }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('POST /api/articles/[slug]/comments error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
