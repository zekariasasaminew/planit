"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ExitToApp, Person, Email, Tag } from "@mui/icons-material";
import { useAuth } from "@/app/context/authContext";
import { signOut } from "@/lib/auth";

export const ProfileCard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await signOut();

      // Redirect to welcome page after sign out
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign out. Please try again.");
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Extract first name from full name
  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "User";

  return (
    <Card
      sx={{
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Welcome Message */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Welcome back, {firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to build your next academic plan?
          </Typography>
        </Box>

        {/* Profile Information */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Avatar
            src={user.user_metadata?.avatar_url}
            sx={{
              width: 80,
              height: 80,
              mr: 3,
            }}
          >
            <Person sx={{ fontSize: 40 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {user.user_metadata?.full_name || "No name provided"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Email sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Tag sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
              <Chip
                label={`ID: ${user.id.slice(0, 8)}...`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.75rem" }}
              />
            </Box>
          </Box>
        </Box>

        {/* Account Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Account Details
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Provider:
              </Typography>
              <Chip
                label={user.app_metadata?.provider || "Google"}
                size="small"
                color="primary"
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Email Verified:
              </Typography>
              <Chip
                label={user.email_confirmed_at ? "Verified" : "Pending"}
                size="small"
                color={user.email_confirmed_at ? "success" : "warning"}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Last Sign In:
              </Typography>
              <Typography variant="body2">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                  : "Unknown"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Sign Out Button */}
        <Button
          variant="outlined"
          fullWidth
          size="large"
          onClick={handleSignOut}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <ExitToApp />
            )
          }
          sx={{
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 600,
            textTransform: "none",
            borderColor: "error.main",
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.main",
              color: "white",
              borderColor: "error.main",
            },
            "&:disabled": {
              borderColor: "rgba(244, 67, 54, 0.3)",
              color: "rgba(244, 67, 54, 0.3)",
            },
          }}
        >
          {loading ? "Signing out..." : "Sign Out"}
        </Button>
      </CardContent>
    </Card>
  );
};
