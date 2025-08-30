"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setError(error.message);

          setTimeout(() => router.replace("/signin"), 3000);
          return;
        }

        if (data.session) {
          const returnTo = searchParams.get("returnTo") || "/";
          router.replace(returnTo);
        } else {
          setError("Authentication session not found");
          setTimeout(() => router.replace("/signin"), 3000);
        }
      } catch {
        setError("Authentication failed");
        setTimeout(() => router.replace("/signin"), 3000);
      }
    };

    // Give Supabase a moment to process the URL hash
    const timer = setTimeout(handleAuthCallback, 100);
    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        textAlign: "center",
        p: 3,
      }}
    >
      <div>
        {error ? (
          <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Authentication Error
            </Typography>
            <Typography variant="body2">{error}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Redirecting to sign in...
            </Typography>
          </Alert>
        ) : (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Completing sign-in...
            </Typography>
          </>
        )}
      </div>
    </Box>
  );
}
