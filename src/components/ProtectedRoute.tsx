"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { useAuth } from "@/app/context/authContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  redirectTo = "/signin",
  requireAuth = true,
}) => {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Don't redirect while loading

    if (requireAuth && !user) {
      // Add current path as return URL for better UX
      const returnUrl = `${redirectTo}?returnTo=${encodeURIComponent(
        pathname
      )}`;
      router.replace(returnUrl);
    }
  }, [user, loading, router, redirectTo, pathname, requireAuth]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      fallback || (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            bgcolor: "background.default",
          }}
        >
          <CircularProgress sx={{ mb: 2 }} size={40} />
          <Typography variant="h6" color="text.secondary">
            Verifying authentication...
          </Typography>
        </Box>
      )
    );
  }

  // Show error state if there's an authentication error
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
          <Typography variant="body1">{error}</Typography>
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Please refresh the page or try signing in again.
        </Typography>
      </Box>
    );
  }

  // If authentication is required but user is not authenticated, don't render
  if (requireAuth && !user) {
    return null; // Redirect is happening in useEffect
  }

  // If authentication is not required or user is authenticated, render children
  return <>{children}</>;
};
