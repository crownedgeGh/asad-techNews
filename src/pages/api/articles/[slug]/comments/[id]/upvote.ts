import type { APIRoute } from 'astro';
import { db } from '../../../../../../db';
import { comments } from '../../../../../../db/schema';
import { eq, sql } from 'drizzle-orm';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const POST: APIRoute = async ({ params, cookies, request }) => {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return new Response(JSON.stringify({ error: 'Invalid comment id' }), { status: 400 });
    }

    const cookieName = `upvoted_${id}`;
    const alreadyUpvoted = cookies.get(cookieName)?.value === '1';
    const secure = new URL(request.url).protocol === 'https:';

    const updated = await db
      .update(comments)
      .set({
        upvotes: alreadyUpvoted ? sql`greatest(${comments.upvotes} - 1, 0)` : sql`${comments.upvotes} + 1`,
      })
      .where(eq(comments.id, id))
      .returning({ upvotes: comments.upvotes });

    if (!updated[0]) {
      return new Response(JSON.stringify({ error: 'Comment not found' }), { status: 404 });
    }

    if (alreadyUpvoted) {
      cookies.delete(cookieName, { path: '/' });
    } else {
      cookies.set(cookieName, '1', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure,
        maxAge: COOKIE_MAX_AGE,
      });
    }

    return new Response(JSON.stringify({ upvotes: updated[0].upvotes, upvoted: !alreadyUpvoted }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/articles/[slug]/comments/[id]/upvote error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
