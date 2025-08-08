import { supabase } from './supabaseClient'

// Rate limiting for authentication attempts
const authAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_AUTH_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now()
  const attempts = authAttempts.get(identifier)
  
  if (!attempts) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now })
    return true
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now })
    return true
  }
  
  if (attempts.count >= MAX_AUTH_ATTEMPTS) {
    return false
  }
  
  attempts.count++
  attempts.lastAttempt = now
  return true
}

export const signInWithGoogle = async (returnTo: string = "/") => {
  try {
    // Basic rate limiting check
    const clientId = 'browser_session' // In production, use a better identifier
    if (!checkRateLimit(clientId)) {
      throw new Error('Too many authentication attempts. Please try again later.')
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
        scopes: 'email profile', // Minimal scopes
      }
    })
    
    if (error) {
      // Log for debugging but don't expose detailed error to user
      console.error('Google login error:', error.message)
      
      // Return user-friendly error messages
      if (error.message.includes('unauthorized_client')) {
        throw new Error('Authentication service is temporarily unavailable. Please try again.')
      } else if (error.message.includes('access_denied')) {
        throw new Error('Access was denied. Please try again.')
      } else {
        throw new Error('Unable to sign in. Please try again.')
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred during sign in.')
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error.message)
      // Even if logout fails on server, clear local data
    }
    
    // Clear all local storage and session storage
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (storageError) {
      console.warn('Unable to clear local storage:', storageError)
    }
    
    // Force redirect to sign in page
    window.location.href = '/signin'
    
  } catch (error) {
    // Ensure local cleanup even if logout API fails
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (storageError) {
      console.warn('Unable to clear local storage:', storageError)
    }
    
    console.error('Logout error:', error)
    // Still redirect to signin even on error
    window.location.href = '/signin'
  }
}

// Utility function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session?.user
  } catch {
    return false
  }
}
