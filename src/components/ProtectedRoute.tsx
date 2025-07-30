"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/app/context/authContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If no user is authenticated, redirect to signin
    if (user === null) {
      router.push("/signin");
    }
  }, [user, router]);

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      fallback || (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <CircularProgress sx={{ color: "white", mb: 2 }} size={40} />
          <Typography variant="h6" sx={{ color: "white" }}>
            Loading...
          </Typography>
        </Box>
      )
    );
  }

  // If user is null (not authenticated), return null as redirect is happening
  if (user === null) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
};
