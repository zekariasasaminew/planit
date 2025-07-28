"use client";

import React from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Alert,
} from "@mui/material";
import { Settings as SettingsIcon, Brightness6 } from "@mui/icons-material";
import { useTheme } from "@/theme/context";

export default function SettingsPage() {
  const { mode, toggleMode } = useTheme();

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <SettingsIcon sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              Settings
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary">
            Customize your PlanIt experience
          </Typography>
        </Box>

        {/* Settings Panel */}
        <Paper sx={{ mb: 4 }}>
          <List>
            {/* Theme Setting */}
            <ListItem>
              <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                <Brightness6 sx={{ mr: 1, color: "text.secondary" }} />
              </Box>
              <ListItemText
                primary="Dark Mode"
                secondary={`Currently using ${mode} theme`}
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={mode === "dark"}
                  onChange={toggleMode}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            {/* Placeholder Settings */}
            <ListItem>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive updates about your academic plan"
              />
              <ListItemSecondaryAction>
                <Switch checked={true} color="primary" disabled />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary="Auto-save Plans"
                secondary="Automatically save changes to your plans"
              />
              <ListItemSecondaryAction>
                <Switch checked={true} color="primary" disabled />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary="Course Reminders"
                secondary="Get notified about important course deadlines"
              />
              <ListItemSecondaryAction>
                <Switch checked={false} color="primary" disabled />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>

        {/* Coming Soon Alert */}
        <Alert severity="info">
          <Typography variant="h6" sx={{ mb: 1 }}>
            More Settings Coming Soon
          </Typography>
          <Typography variant="body1">
            Additional customization options including notification preferences,
            data export, and account management will be available in future
            updates.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
}
