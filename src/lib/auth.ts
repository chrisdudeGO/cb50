import { getSession, cleanSessions } from './db';

// Admin password — set via ADMIN_PASSWORD env var or fallback
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cb50admin';

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export function isAuthenticated(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;

  const cookies = parseCookies(cookieHeader);
  const token = cookies['admin_session'];
  if (!token) return false;

  // Clean old sessions
  cleanSessions.run();

  const session = getSession.get(token);
  return !!session;
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) {
      cookies[name] = rest.join('=');
    }
  });
  return cookies;
}
