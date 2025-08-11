import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '../supabase/server';

export async function getUserOrThrow(_req?: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    const err = new Error('Unauthorized');
    // @ts-expect-error augment
    err.status = 401;
    throw err;
  }
  return data.user;
}

