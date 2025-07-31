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
  Tabs,
  Tab,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
} from "@mui/material";
import {
  ExitToApp,
  Email,
  Tag,
  AccountCircle,
  Settings,
  Palette,
  Security,
  Edit,
  Save,
  Cancel,
  Verified,
  Warning,
  Delete,
  Notifications,
  Language,
  LockReset,
} from "@mui/icons-material";
import { useAuth } from "@/app/context/authContext";
import { signOut } from "@/lib/auth";
import { useTheme } from "@/theme/context";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProfileCard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { mode, toggleMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("English");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await signOut();

      // Redirect to welcome page after sign out
      router.push("/");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign out. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleEditName = () => {
    setTempName(user?.user_metadata?.full_name || "");
    setEditingName(true);
  };

  const handleSaveName = () => {
    // TODO: Implement name update via Supabase API
    console.log("Saving name:", tempName);
    setEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditingName(false);
    setTempName("");
  };

  if (!user) {
    return null;
  }

  // Generate avatar initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const fullName = user.user_metadata?.full_name || "No name provided";
  const isOAuthUser = user.app_metadata?.provider !== "email";

  return (
    <Card
      sx={{
        maxWidth: 800,
        mx: "auto",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header with Avatar and Basic Info */}
        <Box sx={{ p: 4, pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              src={user.user_metadata?.avatar_url}
              sx={{
                width: 100,
                height: 100,
                mr: 3,
                fontSize: "2rem",
                fontWeight: 600,
                bgcolor: "primary.main",
              }}
            >
              {user.user_metadata?.avatar_url ? null : getInitials(fullName)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {fullName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Email sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                <Typography variant="body1" color="text.secondary">
                  {user.email}
                </Typography>
                {user.email_confirmed_at && (
                  <Verified
                    sx={{ ml: 1, fontSize: 18, color: "success.main" }}
                  />
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  icon={<Tag />}
                  label={`${user.app_metadata?.provider || "Google"} Account`}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={`ID: ${user.id.slice(0, 8)}...`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
            variant="fullWidth"
          >
            <Tab
              icon={<AccountCircle />}
              label="Profile"
              id="profile-tab-0"
              aria-controls="profile-tabpanel-0"
            />
            <Tab
              icon={<Settings />}
              label="Preferences"
              id="profile-tab-1"
              aria-controls="profile-tabpanel-1"
            />
            <Tab
              icon={<Security />}
              label="Account"
              id="profile-tab-2"
              aria-controls="profile-tabpanel-2"
            />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mx: 4, mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Profile Information
            </Typography>

            {/* Account Details Grid */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Full Name */}
              <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Full Name
                  </Typography>
                  {!isOAuthUser && (
                    <IconButton
                      size="small"
                      onClick={editingName ? handleCancelEdit : handleEditName}
                      color="primary"
                    >
                      {editingName ? <Cancel /> : <Edit />}
                    </IconButton>
                  )}
                </Box>
                {editingName ? (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      size="small"
                      fullWidth
                      autoFocus
                    />
                    <IconButton
                      size="small"
                      onClick={handleSaveName}
                      color="success"
                    >
                      <Save />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="body1">{fullName}</Typography>
                )}
              </Paper>

              {/* Account Stats */}
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Auth Provider
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {user.app_metadata?.provider || "Google"}
                    </Typography>
                    {user.email_confirmed_at ? (
                      <Verified sx={{ ml: 1, color: "success.main" }} />
                    ) : (
                      <Warning sx={{ ml: 1, color: "warning.main" }} />
                    )}
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Sign In
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "Unknown"}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account Created
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Unique ID
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      fontFamily: "monospace",
                      wordBreak: "break-all",
                    }}
                  >
                    {user.id}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Preferences & Settings
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Theme Settings */}
              <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Palette sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Theme
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === "dark"}
                      onChange={toggleMode}
                      color="primary"
                    />
                  }
                  label={`${mode === "dark" ? "Dark" : "Light"} Mode`}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Choose between light and dark theme for the interface
                </Typography>
              </Paper>

              {/* Notification Settings */}
              <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Notifications sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Notifications
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      color="primary"
                      disabled
                    />
                  }
                  label="Enable notifications"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Receive notifications about plan updates and reminders (Coming
                  Soon)
                </Typography>
              </Paper>

              {/* Language Settings */}
              <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Language sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Language
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    label="Language"
                    disabled
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                    <MenuItem value="French">French</MenuItem>
                  </Select>
                </FormControl>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Change the interface language (Coming Soon)
                </Typography>
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        {/* Account Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Account Settings
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Change Password (only for email users) */}
              {!isOAuthUser && (
                <Paper sx={{ p: 3, bgcolor: "background.default" }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LockReset sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Password
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<LockReset />}
                    sx={{ textTransform: "none" }}
                  >
                    Change Password
                  </Button>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Update your account password
                  </Typography>
                </Paper>
              )}

              {/* Danger Zone */}
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "error.dark",
                  color: "error.contrastText",
                  border: 1,
                  borderColor: "error.main",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 2, color: "error.contrastText" }}
                >
                  Danger Zone
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Sign Out */}
                  <Box>
                    <Button
                      variant="contained"
                      color="error"
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
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      {loading ? "Signing out..." : "Sign Out"}
                    </Button>
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "error.contrastText", opacity: 0.8 }}
                    >
                      Sign out from your current session
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: "error.main", opacity: 0.3 }} />

                  {/* Delete Account */}
                  <Box>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled
                      startIcon={<Delete />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "error.main",
                        color: "error.contrastText",
                        opacity: 0.5,
                      }}
                    >
                      Delete Account
                    </Button>
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "error.contrastText", opacity: 0.8 }}
                    >
                      Permanently delete your account and all data (Coming Soon)
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </TabPanel>
      </CardContent>
    </Card>
  );
};
