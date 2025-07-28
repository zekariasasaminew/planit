"use client";

import React from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Tooltip,
} from "@mui/material";
import { Menu, AutoAwesome, AccountCircle } from "@mui/icons-material";
import { ThemeToggle } from "./ThemeToggle";

interface AppBarProps {
  open: boolean;
  onMenuToggle: () => void;
  drawerWidth: number;
}

export const AppBar: React.FC<AppBarProps> = ({
  open,
  onMenuToggle,
  drawerWidth,
}) => {
  return (
    <MuiAppBar
      position="fixed"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: (theme) =>
          theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        ...(open && {
          marginLeft: { md: drawerWidth },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }),
      }}
    >
      <Toolbar>
        {/* Hamburger Menu Button */}
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={onMenuToggle}
          edge="start"
          sx={{
            mr: 2,
            ...(open && { display: { md: "none" } }),
          }}
        >
          <Menu />
        </IconButton>

        {/* Logo and Title */}
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <AutoAwesome sx={{ mr: 1, display: { xs: "none", sm: "block" } }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              display: { xs: "none", sm: "block" },
            }}
          >
            PlanIt
          </Typography>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              display: { xs: "block", sm: "none" },
            }}
          >
            PlanIt
          </Typography>
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile Avatar */}
          <Tooltip title="Profile">
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};
