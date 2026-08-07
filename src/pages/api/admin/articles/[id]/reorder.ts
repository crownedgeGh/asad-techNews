import type { APIRoute } from 'astro';
import { db } from '../../../../../db';
import { articles } from '../../../../../db/schema';
import { eq, ne, asc } from 'drizzle-orm';

const MAX_POSITION = 15;

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!, 10);
    const { position } = await request.json() as { position: number };

    if (!Number.isInteger(position) || position < 0 || position > MAX_POSITION) {
      return new Response(JSON.stringify({ error: 'position must be between 0 and 15' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [current] = await db.select().from(articles).where(eq(articles.id, id));
    if (!current) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ranked (pinned) articles, excluding the one being moved, in their current order.
    const ranked = await db
      .select()
      .from(articles)
      .where(ne(articles.sortOrder, 0))
      .orderBy(asc(articles.sortOrder));
    const others = ranked.filter((a) => a.id !== id);

    if (position === 0) {
      // Unpin: falls back to date/time ordering.
      await db.update(articles).set({ sortOrder: 0 }).where(eq(articles.id, id));
    } else {
      const insertAt = Math.min(position - 1, others.length);
      others.splice(insertAt, 0, current);

      await Promise.all(
        others.map((a, i) =>
          a.sortOrder === i + 1
            ? Promise.resolve()
            : db.update(articles).set({ sortOrder: i + 1 }).where(eq(articles.id, a.id))
        )
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/admin/articles/[id]/reorder error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
