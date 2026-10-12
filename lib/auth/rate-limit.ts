import 'server-only';

import { headers } from 'next/headers';
import { client } from '@/lib/db/drizzle';

const SIGNUP_GLOBAL_LIMIT = 20;
const SIGNUP_GLOBAL_WINDOW_SECONDS = 10 * 60;
const SIGNUP_IP_LIMIT = 8;
const SIGNUP_IP_WINDOW_SECONDS = 15 * 60;

const SIGNIN_GLOBAL_LIMIT = 200;
const SIGNIN_GLOBAL_WINDOW_SECONDS = 10 * 60;
const SIGNIN_IP_LIMIT = 30;
const SIGNIN_IP_WINDOW_SECONDS = 15 * 60;

const SIGNUP_LIMIT_MESSAGE = 'Too many registration attempts. Please try again in a few minutes.';
const SIGNIN_LIMIT_MESSAGE = 'Too many sign-in attempts. Please try again in a few minutes.';

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const vercelForwarded = headerList.get('x-vercel-forwarded-for');
  const realIp = headerList.get('x-real-ip');
  const raw = (vercelForwarded ?? realIp ?? 'unknown').split(',')[0]?.trim() ?? 'unknown';
  const cleaned = raw.replace(/[^a-zA-Z0-9:.]/g, '').slice(0, 64);
  return cleaned || 'unknown';
}

async function consumeBucket(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
  const rows = await client`
    INSERT INTO auth_rate_limits (bucket, hits, window_start)
    VALUES (${bucket}, 1, now())
    ON CONFLICT (bucket) DO UPDATE SET
      hits = CASE
        WHEN auth_rate_limits.window_start <= now() - (${windowSeconds} * interval '1 second') THEN 1
        ELSE auth_rate_limits.hits + 1
      END,
      window_start = CASE
        WHEN auth_rate_limits.window_start <= now() - (${windowSeconds} * interval '1 second') THEN now()
        ELSE auth_rate_limits.window_start
      END
    RETURNING hits
  `;

  return Number(rows[0]?.hits ?? limit + 1) <= limit;
}

export async function enforceAuthRateLimit(action: 'signup' | 'signin'): Promise<string | null> {
  const ip = await getClientIp();
  const blockedMessage = action === 'signup' ? SIGNUP_LIMIT_MESSAGE : SIGNIN_LIMIT_MESSAGE;

  try {
    await client`
      DELETE FROM auth_rate_limits
      WHERE window_start < now() - interval '1 day'
    `;

    if (action === 'signup') {
      const globalAllowed = await consumeBucket('signup:global', SIGNUP_GLOBAL_LIMIT, SIGNUP_GLOBAL_WINDOW_SECONDS);
      if (!globalAllowed) return blockedMessage;
      const ipAllowed = await consumeBucket(`signup:ip:${ip}`, SIGNUP_IP_LIMIT, SIGNUP_IP_WINDOW_SECONDS);
      if (!ipAllowed) return blockedMessage;
      return null;
    }

    const globalAllowed = await consumeBucket('signin:global', SIGNIN_GLOBAL_LIMIT, SIGNIN_GLOBAL_WINDOW_SECONDS);
    if (!globalAllowed) return blockedMessage;
    const ipAllowed = await consumeBucket(`signin:ip:${ip}`, SIGNIN_IP_LIMIT, SIGNIN_IP_WINDOW_SECONDS);
    if (!ipAllowed) return blockedMessage;
    return null;
  } catch (error) {
    console.error('Auth rate limit check failed:', error);
    return blockedMessage;
  }
}
