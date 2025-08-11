import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  // Ensure a sample user is present in public.users for local RLS testing
  const userId = process.env.DEV_USER_ID || '00000000-0000-0000-0000-000000000001';
  await supabase.from('users').upsert({ id: userId, full_name: 'Dev User' });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

