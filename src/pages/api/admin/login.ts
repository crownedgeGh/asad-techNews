import type { APIRoute } from 'astro';
import { ADMIN_ID, ADMIN_PASSWORD, setAdminSession } from '../../../lib/adminAuth';

export const POST: APIRoute = async ({ request, cookies }) => {
  let id: string | undefined;
  let password: string | undefined;

  try {
    const body = await request.json();
    id = body.id;
    password = body.password;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (id !== ADMIN_ID || password !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Invalid ID or password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  setAdminSession(cookies);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
