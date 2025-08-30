import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

// Create client using auth helpers for proper Next.js integration
let _supabase: ReturnType<typeof createPagesBrowserClient> | null = null

export const supabase = new Proxy({} as ReturnType<typeof createPagesBrowserClient>, {
  get(target, prop) {
    if (!_supabase) {
      _supabase = createPagesBrowserClient()
    }
    return _supabase[prop as keyof typeof _supabase]
  }
})
