import { supabase } from '@/shared/services/supabase';
import { env } from '@/shared/config/env';

/**
 * callFunction — CORS-safe caller for the project's Edge Functions from the browser.
 *
 * We do NOT use supabase.functions.invoke: it adds `apikey` / `x-client-info`
 * headers that the functions' CORS (`Access-Control-Allow-Headers: Content-Type,
 * Authorization`) does not allow, so the browser preflight fails ("Failed to
 * fetch"). Here we send ONLY the allowed headers; the planner's JWT in
 * Authorization is enough for the gateway and verifyAuth.
 *
 * Unwraps the `{ success, data }` envelope and surfaces the function's real error
 * message on non-2xx.
 */
export async function callFunction<T>(
  name: string,
  opts: { method?: 'GET' | 'POST'; body?: unknown } = {},
): Promise<T> {
  const method = opts.method ?? 'POST';
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');

  const headers: Record<string, string> = { Authorization: `Bearer ${session.access_token}` };
  if (method === 'POST') headers['Content-Type'] = 'application/json';

  const res = await fetch(`${env.supabaseUrl}/functions/v1/${name}`, {
    method,
    headers,
    body: method === 'POST' ? JSON.stringify(opts.body ?? {}) : undefined,
  });

  const raw = await res.text();
  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const message =
      (parsed as { error?: { message?: string } } | null)?.error?.message ||
      (raw && raw.length < 200 ? raw : '') ||
      `Error ${res.status}`;
    console.error(`[fn:${name}] error`, res.status, parsed ?? raw);
    throw new Error(message);
  }

  const envelope = parsed as { data?: T } | null;
  return (envelope && typeof envelope === 'object' && 'data' in envelope
    ? (envelope.data as T)
    : (parsed as T));
}
