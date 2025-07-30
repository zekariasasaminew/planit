import { supabase } from './supabaseClient'

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })
  if (error) console.error('Google login error:', error.message)
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Logout error:', error.message)
}
