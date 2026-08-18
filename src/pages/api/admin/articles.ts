import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { articles } from '../../../db/schema';
import { and, asc, desc, ilike, or, sql, eq } from 'drizzle-orm';

const PAGE_SIZE = 15;

// Word-order/punctuation-insensitive fingerprint used to atomically block duplicate
// posts at the DB level via a unique index - catches the same story being posted
// twice with the same (or near-identical) title, which a check-then-insert can miss
// under concurrent requests.
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ');
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const offset = (page - 1) * PAGE_SIZE;
    const search = url.searchParams.get('search')?.trim() || '';
    const filter = url.searchParams.get('filter') || 'all';
    const category = url.searchParams.get('category')?.trim() || '';

    const conditions = [];
    if (search) {
      conditions.push(
        or(ilike(articles.title, `%${search}%`), ilike(articles.content, `%${search}%`))
      );
    }
    if (category && category !== 'all') {
      conditions.push(eq(articles.category, category));
    }
    if (filter === 'published') {
      conditions.push(eq(articles.published, true));
    } else if (filter === 'draft') {
      conditions.push(eq(articles.published, false));
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const orderBy =
      filter === 'most_viewed'
        ? [desc(articles.views)]
        : filter === 'most_liked'
        ? [desc(articles.likes)]
        : [sql`(${articles.sortOrder} = 0)`, asc(articles.sortOrder), desc(articles.createdAt)];

    const [rows, [{ count }]] = await Promise.all([
      db
        .select()
        .from(articles)
        .where(where)
        .orderBy(...orderBy)
        .limit(PAGE_SIZE)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(articles).where(where),
    ]);

    return new Response(
      JSON.stringify({ articles: rows, total: count, page, pageSize: PAGE_SIZE }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('GET /api/admin/articles error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async () => {
  try {
    await db.delete(articles);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('DELETE /api/admin/articles error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, slug, content, category, coverImage, published, trending, featured, homepage, credit } = body;

    if (!title || !slug || !content || !category) {
      return new Response(
        JSON.stringify({ error: 'title, slug, content and category are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // sortOrder defaults to 0 (unranked), so new articles fall back to date/time ordering
    // on the public portal until an admin explicitly pins them to a position.
    const [created] = await db
      .insert(articles)
      .values({
        title,
        slug,
        content,
        category,
        coverImage: coverImage ?? null,
        published: published ?? false,
        trending: trending ?? false,
        featured: featured ?? false,
        homepage: homepage ?? false,
        credit: credit ?? null,
        normalizedTitle: normalizeTitle(title),
      })
      .returning();

    return new Response(JSON.stringify({ success: true, article: created }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('POST /api/admin/articles error:', err);
    const pgCode = err?.cause?.code || err?.code;
    const constraint = err?.cause?.constraint || err?.constraint || '';
    if (pgCode === '23505' && constraint.includes('normalized_title')) {
      return new Response(JSON.stringify({ error: 'An article with this title already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (pgCode === '23505') {
      return new Response(JSON.stringify({ error: 'Slug already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
