
import { createSupabaseServerClient } from '../supabase/server';

export async function getUserOrThrow() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    const err = new Error('Unauthorized');
    // @ts-expect-error augment
    err.status = 401;
    throw err;
  }
  return data.user;
}

