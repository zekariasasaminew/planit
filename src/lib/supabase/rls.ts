import { createSupabaseServiceClient } from './server';

const RATE_LIMIT_WINDOW_SEC = parseInt(process.env.RATE_LIMIT_WINDOW_SEC || '60', 10);
const RATE_LIMIT_MAX_CALLS = parseInt(process.env.RATE_LIMIT_MAX_CALLS || '10', 10);

export async function recordRequest(userId: string, kind: string) {
  const supabase = createSupabaseServiceClient();
  await supabase.from('request_log').insert({ user_id: userId, kind });
}

export async function checkRateLimit(userId: string, kind: string): Promise<{ allowed: boolean; remaining: number }>
{
  const supabase = createSupabaseServiceClient();
  // Count within the window
  const { count } = await supabase
    .from('request_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('kind', kind)
    .gte('created_at', new Date(Date.now() - RATE_LIMIT_WINDOW_SEC * 1000).toISOString());

  const used = count ?? 0;
  const remaining = Math.max(0, RATE_LIMIT_MAX_CALLS - used);
  return { allowed: used < RATE_LIMIT_MAX_CALLS, remaining };
}

