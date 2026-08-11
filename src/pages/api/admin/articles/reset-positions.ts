import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { articles } from '../../../../db/schema';
import { ne } from 'drizzle-orm';

// Resets every pinned article back to sortOrder 0, so the list falls back
// to pure date/time ordering (see GET /api/admin/articles' orderBy).
export const POST: APIRoute = async () => {
  try {
    await db.update(articles).set({ sortOrder: 0 }).where(ne(articles.sortOrder, 0));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/admin/articles/reset-positions error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
