import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  const webhookUrl = import.meta.env.N8N_WEBHOOK_URL;
  const webhookSecret = import.meta.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    return new Response(JSON.stringify({ error: 'N8N_WEBHOOK_URL / N8N_WEBHOOK_SECRET are not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // The n8n Webhook node responds immediately (before the pipeline finishes) since
    // full runs (RSS fetch + AI rewrite + image search/upload) can take well over a
    // minute - longer than this serverless function should hold a connection open.
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'X-Webhook-Secret': webhookSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return new Response(
        JSON.stringify({ error: `n8n webhook returned ${res.status}`, detail: text.slice(0, 500) }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/admin/pipeline/run error:', err);
    return new Response(JSON.stringify({ error: 'Could not reach n8n webhook' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
