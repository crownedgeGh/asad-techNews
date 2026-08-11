import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { articles } from '../../../../db/schema';
import { eq, sql } from 'drizzle-orm';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const POST: APIRoute = async ({ params, cookies, request }) => {
  try {
    const slug = params.slug;
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
    }

    const rows = await db
      .select({ id: articles.id, likes: articles.likes })
      .from(articles)
      .where(eq(articles.slug, slug));
    const article = rows[0];
    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), { status: 404 });
    }

    const cookieName = `liked_${article.id}`;
    const alreadyLiked = cookies.get(cookieName)?.value === '1';
    const secure = new URL(request.url).protocol === 'https:';

    let likes: number;
    if (alreadyLiked) {
      const updated = await db
        .update(articles)
        .set({ likes: sql`greatest(${articles.likes} - 1, 0)` })
        .where(eq(articles.id, article.id))
        .returning({ likes: articles.likes });
      likes = updated[0].likes;
      cookies.delete(cookieName, { path: '/' });
    } else {
      const updated = await db
        .update(articles)
        .set({ likes: sql`${articles.likes} + 1` })
        .where(eq(articles.id, article.id))
        .returning({ likes: articles.likes });
      likes = updated[0].likes;
      cookies.set(cookieName, '1', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure,
        maxAge: COOKIE_MAX_AGE,
      });
    }

    return new Response(JSON.stringify({ likes, liked: !alreadyLiked }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/articles/[slug]/like error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
