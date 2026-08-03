import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { articles } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!, 10);
    const [article] = await db.select().from(articles).where(eq(articles.id, id));

    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(article), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /api/admin/articles/[id] error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!, 10);
    const body = await request.json();
    const { title, slug, content, category, coverImage, published } = body;

    const [updated] = await db
      .update(articles)
      .set({
        title,
        slug,
        content,
        category,
        coverImage: coverImage ?? null,
        published: published ?? false,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, article: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('PUT /api/admin/articles/[id] error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!, 10);
    const [deleted] = await db
      .delete(articles)
      .where(eq(articles.id, id))
      .returning({ id: articles.id });

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('DELETE /api/admin/articles/[id] error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
