import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Define protected routes that require authentication
    const protectedPaths = [
      '/generate',
      '/planner', 
      '/saved-plans',
      '/settings',
      '/profile'
    ]
    
    const isProtectedPath = protectedPaths.some(path => 
      req.nextUrl.pathname.startsWith(path)
    )

    // Redirect unauthenticated users from protected routes
    if (isProtectedPath && !session) {
      const redirectUrl = new URL('/signin', req.url)
      // Add return URL for better UX after login
      redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect authenticated users away from signin page
    if (req.nextUrl.pathname === '/signin' && session) {
      const returnTo = req.nextUrl.searchParams.get('returnTo') || '/'
      return NextResponse.redirect(new URL(returnTo, req.url))
    }

    return res
  } catch (error) {
    // If auth check fails, redirect to signin for protected routes
    const protectedPaths = ['/generate', '/planner', '/saved-plans', '/settings', '/profile']
    const isProtectedPath = protectedPaths.some(path => 
      req.nextUrl.pathname.startsWith(path)
    )
    
    if (isProtectedPath) {
      return NextResponse.redirect(new URL('/signin', req.url))
    }
    
    return res
  }
}

export const config = {
  matcher: [
    '/generate/:path*',
    '/planner/:path*', 
    '/saved-plans/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/signin'
  ]
}