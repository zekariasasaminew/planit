"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import { useAuth } from "@/app/context/authContext";
import { SignInCard } from "@/components/SignInCard";
import { AnimatedBackground } from "@/components";

function SignInContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;

    // If user is already logged in, redirect appropriately
    if (user) {
      const returnTo = searchParams.get("returnTo") || "/";
      router.replace(returnTo);
    }
  }, [user, loading, router, searchParams]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <AnimatedBackground />
        <CircularProgress sx={{ zIndex: 1 }} />
      </Box>
    );
  }

  // Don't render signin form if user is already logged in
  if (user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        py: 4,
      }}
    >
      <AnimatedBackground />
      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 600,
              mb: 1,
            }}
          >
            PlanIt
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {"Sign in to get started"}
          </Typography>
        </Box>

        <SignInCard />
      </Container>
    </Box>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <AnimatedBackground />
          <CircularProgress sx={{ zIndex: 1 }} />
        </Box>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
