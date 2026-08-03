import type { APIRoute } from 'astro';
import { db } from '../../../../../db';
import { articles } from '../../../../../db/schema';
import { eq, gt, lt, asc } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!, 10);
    const { direction } = await request.json() as { direction: 'up' | 'down' };

    // Get the current article
    const [current] = await db.select().from(articles).where(eq(articles.id, id));
    if (!current) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let neighbor: typeof current | undefined;

    if (direction === 'up') {
      // Find article with next lower sortOrder
      const results = await db
        .select()
        .from(articles)
        .where(lt(articles.sortOrder, current.sortOrder))
        .orderBy(asc(articles.sortOrder))
        .limit(1);
      neighbor = results[results.length - 1];
    } else {
      // Find article with next higher sortOrder
      const results = await db
        .select()
        .from(articles)
        .where(gt(articles.sortOrder, current.sortOrder))
        .orderBy(asc(articles.sortOrder))
        .limit(1);
      neighbor = results[0];
    }

    if (!neighbor) {
      return new Response(
        JSON.stringify({ success: true, message: 'Already at boundary' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Swap sort orders
    await Promise.all([
      db
        .update(articles)
        .set({ sortOrder: neighbor.sortOrder })
        .where(eq(articles.id, current.id)),
      db
        .update(articles)
        .set({ sortOrder: current.sortOrder })
        .where(eq(articles.id, neighbor.id)),
    ]);

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
