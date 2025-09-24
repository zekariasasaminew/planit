
import { createSupabaseServerClient, createSupabaseServiceClient } from '../supabase/server';

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

export async function ensureUserRecord(user: any) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from('users')
    .upsert({ 
      id: user.id, 
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      avatar_url: user.user_metadata?.avatar_url 
    }, { 
      onConflict: 'id',
      ignoreDuplicates: true 
    });
  
  if (error) {
    console.error('Failed to ensure user record:', error);
  }
  
  return !error;
}

