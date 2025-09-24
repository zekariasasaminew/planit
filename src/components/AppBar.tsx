"use client";

import React from "react";
import { useRouter } from "next/navigation";
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

interface AppBarProps {
  open: boolean;
  onMenuToggle: () => void;
  drawerWidth: number;
  isMobile: boolean;
}

export const AppBar: React.FC<AppBarProps> = ({
  open,
  onMenuToggle,
  drawerWidth,
  isMobile,
}) => {
  const router = useRouter();
  return (
    <MuiAppBar
      position="fixed"
      elevation={2}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: (theme) =>
          theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        ...(!isMobile &&
          open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
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
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={onMenuToggle}
          edge="start"
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>

        {/* Logo and Title - Always show since sidebar no longer has logo */}
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
          {/* Profile Avatar */}
          <Tooltip title="View Profile">
            <IconButton
              color="inherit"
              sx={{ ml: 1 }}
              aria-label="User profile"
              onClick={() => router.push("/profile")}
            >
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
