"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box, IconButton, Avatar, Tooltip, useTheme } from "@mui/material";
import { Menu, Close, AccountCircle } from "@mui/icons-material";
import { spacing } from "@/theme/theme";

interface FloatingNavigationProps {
  open: boolean;
  onMenuToggle: () => void;
}

export const FloatingNavigation: React.FC<FloatingNavigationProps> = ({
  open,
  onMenuToggle,
}) => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        top: spacing.lg,
        left: {
          xs: 0,
          md: open ? 300 : 0,
        },
        right: 0,
        zIndex: 1300, // Higher than sidebar z-index (1200)
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 3,
        pointerEvents: "none", // Allow clicks to pass through the container
        transition: theme.transitions.create(["left"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* Left side - Hamburger Menu */}
      <Tooltip title={open ? "Close navigation menu" : "Open navigation menu"}>
        <IconButton
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={onMenuToggle}
          sx={{
            backgroundColor: open
              ? "rgba(230, 128, 87, 0.9)" // Different color when open
              : "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${open ? "rgba(230, 128, 87, 0.5)" : "rgba(255, 255, 255, 0.2)"}`,
            color: open ? "white" : "text.primary",
            pointerEvents: "auto", // Enable clicks on this button
            "&:hover": {
              backgroundColor: open
                ? "rgba(230, 128, 87, 1)"
                : "rgba(255, 255, 255, 0.2)",
              transform: "scale(1.05)",
            },
            transition: theme.transitions.create(
              ["background-color", "transform", "border-color", "color"],
              {
                duration: theme.transitions.duration.short,
              }
            ),
          }}
        >
          {open ? <Close /> : <Menu />}
        </IconButton>
      </Tooltip>

      {/* Right side - Profile Avatar */}
      <Tooltip title="View Profile">
        <IconButton
          aria-label="User profile"
          onClick={() => router.push("/profile")}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            pointerEvents: "auto", // Enable clicks on this button
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              transform: "scale(1.05)",
            },
            transition: theme.transitions.create(
              ["background-color", "transform"],
              {
                duration: theme.transitions.duration.short,
              }
            ),
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "rgba(230, 128, 87, 0.8)", // Semi-transparent version of the accent color
              color: "white",
            }}
          >
            <AccountCircle />
          </Avatar>
        </IconButton>
      </Tooltip>
    </Box>
  );
};
