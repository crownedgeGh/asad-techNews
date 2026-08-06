import type { APIRoute } from 'astro';
import { injectLinkPreviews } from '../../../lib/renderArticleContent';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { content } = await request.json();
    if (typeof content !== 'string') {
      return new Response(JSON.stringify({ error: 'content must be a string' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const html = await injectLinkPreviews(content);

    return new Response(JSON.stringify({ html }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/admin/preview-content error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
