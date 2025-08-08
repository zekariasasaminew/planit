import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format')
}

// Validate anon key format (basic check)
if (supabaseAnonKey.length < 32) {
  throw new Error('Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY format')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
    // Enhanced security options
    storageKey: 'planit-auth',
  },
  global: {
    headers: {
      'X-Client-Info': 'planit-web'
    }
  }
})
