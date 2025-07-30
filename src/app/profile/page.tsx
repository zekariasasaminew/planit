"use client";

import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfileCard } from "@/components/ProfileCard";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 600,
                mb: 1,
              }}
            >
              Your Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account and preferences
            </Typography>
          </Box>

          <ProfileCard />
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
