export const prerender = false;

import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';
import { getAllGuests, getStats, updateGuest, deleteGuest, getGuestById } from '../../../lib/db';

// GET — list all guests + stats
export const GET: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request.headers.get('cookie'))) {
    return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const guests = getAllGuests.all();
  const stats = getStats();

  return new Response(JSON.stringify({ guests, stats }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// PUT — update a guest
export const PUT: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request.headers.get('cookie'))) {
    return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();
    const id = data.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID fehlt' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const existing = getGuestById.get(id);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Gast nicht gefunden' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    updateGuest.run({
      id,
      name: data.name ?? (existing as any).name,
      email: data.email ?? (existing as any).email,
      dabei: data.dabei ?? (existing as any).dabei,
      personen: data.personen ?? (existing as any).personen,
      unvertraeglichkeiten: data.unvertraeglichkeiten ?? (existing as any).unvertraeglichkeiten,
      nachricht: data.nachricht ?? (existing as any).nachricht,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Update error:', err);
    return new Response(JSON.stringify({ error: 'Interner Fehler' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

// DELETE — delete a guest
export const DELETE: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request.headers.get('cookie'))) {
    return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();
    const id = data.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID fehlt' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    deleteGuest.run(id);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Delete error:', err);
    return new Response(JSON.stringify({ error: 'Interner Fehler' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
