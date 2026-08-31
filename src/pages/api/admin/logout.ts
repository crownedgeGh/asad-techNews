import type { APIRoute } from 'astro';
import { clearAdminSession } from '../../../lib/adminAuth';

export const POST: APIRoute = async ({ cookies }) => {
  clearAdminSession(cookies);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
