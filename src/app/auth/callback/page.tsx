"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Supabase JS parses the auth hash automatically when detectSessionInUrl is true.
    // We wait a tick to allow it to store the session, then redirect to returnTo/home.
    const timer = setTimeout(() => {
      const returnTo = searchParams.get("returnTo") || "/";
      router.replace(returnTo);
    }, 50);

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
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Completing sign-in...
        </Typography>
      </div>
    </Box>
  );
}
