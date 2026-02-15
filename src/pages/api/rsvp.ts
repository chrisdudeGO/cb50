export const prerender = false;

import type { APIRoute } from 'astro';
import { insertGuest } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    const name = data.Name?.trim() || '';
    const email = data.Email?.trim() || '';
    const dabei = data.Dabei || '';
    const personen = parseInt(data.Personen) || 1;
    const ernaehrung = data.Ernaehrung || '';
    const unvertraeglichkeiten = data['Unverträglichkeiten'] || '';
    const nachricht = data.Nachricht || '';

    if (!name || !email) {
      return new Response(JSON.stringify({ result: 'error', message: 'Name und Email sind erforderlich' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    insertGuest.run({
      name,
      email,
      dabei,
      personen,
      ernaehrung,
      unvertraeglichkeiten,
      nachricht,
    });

    return new Response(JSON.stringify({ result: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error('RSVP error:', err);
    return new Response(JSON.stringify({ result: 'error', message: 'Interner Fehler' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
