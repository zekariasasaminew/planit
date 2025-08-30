"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Google } from "@mui/icons-material";
import { signInWithGoogle } from "@/lib/auth";

export const SignInCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const returnTo = window.location.search.includes("returnTo=")
        ? new URLSearchParams(window.location.search).get("returnTo") || "/"
        : "/";
      await signInWithGoogle(returnTo);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign in. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
        mx: "auto",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleGoogleSignIn}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Google />
            )
          }
          sx={{
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 600,
            textTransform: "none",
            backgroundColor: "#4285f4",
            "&:hover": {
              backgroundColor: "#3367d6",
            },
            "&:disabled": {
              backgroundColor: "rgba(66, 133, 244, 0.6)",
            },
          }}
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>
      </CardContent>
    </Card>
  );
};
