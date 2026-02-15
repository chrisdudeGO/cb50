export const prerender = false;

import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';
import { getAllTasks, toggleTask, addTask, deleteTask, getTaskStats } from '../../../lib/db';

// GET — all tasks grouped by section
export const GET: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request.headers.get('cookie'))) {
    return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tasks = getAllTasks.all();
  const stats = getTaskStats();

  // Group by section
  const sections: Record<string, any[]> = {};
  for (const t of tasks as any[]) {
    if (!sections[t.section]) sections[t.section] = [];
    sections[t.section].push(t);
  }

  return new Response(JSON.stringify({ sections, stats }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// PUT — toggle a task
export const PUT: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request.headers.get('cookie'))) {
    return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await request.json();
  if (!data.id) {
    return new Response(JSON.stringify({ error: 'ID fehlt' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  toggleTask.run(data.id);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// POST — add a new task
export const POST: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request.headers.get('cookie'))) {
    return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await request.json();
  if (!data.section || !data.title) {
    return new Response(JSON.stringify({ error: 'Section und Title erforderlich' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  addTask.run({ section: data.section, title: data.title, sort_order: data.sort_order || 99 });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// DELETE — remove a task
export const DELETE: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request.headers.get('cookie'))) {
    return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await request.json();
  if (!data.id) {
    return new Response(JSON.stringify({ error: 'ID fehlt' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  deleteTask.run(data.id);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
