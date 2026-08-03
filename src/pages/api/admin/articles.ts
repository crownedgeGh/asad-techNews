import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { articles } from '../../../db/schema';
import { desc, sql, eq } from 'drizzle-orm';

const PAGE_SIZE = 15;

export const GET: APIRoute = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const offset = (page - 1) * PAGE_SIZE;

    const [rows, [{ count }]] = await Promise.all([
      db
        .select()
        .from(articles)
        .orderBy(articles.sortOrder, desc(articles.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(articles),
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, slug, content, category, coverImage, published } = body;

    if (!title || !slug || !content || !category) {
      return new Response(
        JSON.stringify({ error: 'title, slug, content and category are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Assign sortOrder as max + 1
    const [{ maxOrder }] = await db
      .select({ maxOrder: sql<number>`coalesce(max(sort_order), 0)` })
      .from(articles);

    const [created] = await db
      .insert(articles)
      .values({
        title,
        slug,
        content,
        category,
        coverImage: coverImage ?? null,
        published: published ?? false,
        sortOrder: (maxOrder ?? 0) + 1,
      })
      .returning();

    return new Response(JSON.stringify({ success: true, article: created }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('POST /api/admin/articles error:', err);
    if (err?.message?.includes('unique')) {
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
