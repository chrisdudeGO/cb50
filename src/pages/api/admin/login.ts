export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyPassword, generateToken } from '../../../lib/auth';
import { createSession } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const password = data.password || '';

    if (!verifyPassword(password)) {
      return new Response(JSON.stringify({ error: 'Falsches Passwort' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = generateToken();
    createSession.run(token);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ error: 'Interner Fehler' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
