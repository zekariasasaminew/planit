"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography } from "@mui/material";
import { useAuth } from "@/app/context/authContext";
import { SignInCard } from "@/components/SignInCard";

export default function SignInPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      router.push("/");
    }
  }, [user, router]);

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
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
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
            Sign in to get started
          </Typography>
        </Box>

        <SignInCard />
      </Container>
    </Box>
  );
}
