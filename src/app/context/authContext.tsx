"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      setError(null);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.refreshSession();

      if (sessionError) {
        console.error("Session refresh error:", sessionError);
        setError("Session expired. Please sign in again.");
        setUser(null);
        setSession(null);
        return;
      }

      setUser(session?.user ?? null);
      setSession(session);
    } catch (err) {
      console.error("Unexpected error during session refresh:", err);
      setError("An unexpected error occurred. Please sign in again.");
      setUser(null);
      setSession(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Initial session error:", sessionError);
          setError("Unable to verify authentication status.");
          if (mounted) {
            setUser(null);
            setSession(null);
          }
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          setSession(session);
        }
      } catch (err) {
        console.error("Unexpected error getting session:", err);
        if (mounted) {
          setError("Unable to verify authentication status.");
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Set up auth state change listener with enhanced error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event);

      if (!mounted) return;

      try {
        setError(null);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setUser(session?.user ?? null);
          setSession(session);
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setSession(null);
          setLoading(false);

          // Clear any cached data on signout
          try {
            localStorage.removeItem("planit-auth");
            sessionStorage.clear();
          } catch (storageError) {
            console.warn("Unable to clear storage on signout:", storageError);
          }
        } else if (event === "USER_UPDATED") {
          setUser(session?.user ?? null);
          setSession(session);
        }
      } catch (err) {
        console.error("Error handling auth state change:", err);
        if (mounted) {
          setError("Authentication error occurred.");
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auto-refresh session when it's close to expiring
  useEffect(() => {
    if (!session?.expires_at) return;

    const expiresAt = session.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeToExpiry = expiresAt - now;

    // Refresh 5 minutes before expiry
    const refreshTime = timeToExpiry - 5 * 60 * 1000;

    if (refreshTime > 0) {
      const timeoutId = setTimeout(() => {
        refreshSession();
      }, refreshTime);

      return () => clearTimeout(timeoutId);
    }
  }, [session, refreshSession]);

  const value = {
    user,
    session,
    loading,
    error,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
