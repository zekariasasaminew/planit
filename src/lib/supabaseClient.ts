import { createBrowserClient } from '@supabase/ssr'

// Create client using @supabase/ssr for proper Next.js integration
let _supabase: ReturnType<typeof createBrowserClient> | null = null

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(target, prop) {
    if (!_supabase) {
      _supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }
    return _supabase[prop as keyof typeof _supabase]
  }
})
