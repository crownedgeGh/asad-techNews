import type { APIRoute } from 'astro';
import { injectLinkPreviews } from '../../../lib/renderArticleContent';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { content } = await request.json();
    const renderedContent = await injectLinkPreviews(content ?? '');

    return new Response(JSON.stringify({ content: renderedContent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/admin/render-preview error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
