"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Dashboard,
  AutoAwesome,
  BookmarkBorder,
  School,
  Settings,
} from "@mui/icons-material";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  width: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Dashboard />,
    path: "/",
  },
  {
    id: "generate",
    label: "Generate Plan",
    icon: <AutoAwesome />,
    path: "/generate",
  },
  {
    id: "saved-plans",
    label: "Saved Plans",
    icon: <BookmarkBorder />,
    path: "/saved-plans",
  },
  {
    id: "majors",
    label: "Majors & Requirements",
    icon: <School />,
    path: "/majors",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings />,
    path: "/settings",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, width }) => {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path); // Debug log
    router.push(path);
    // Always close sidebar after navigation (both mobile and desktop)
    onClose();
  };

  const drawerContent = (
    <Box
      sx={{ width, height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Navigation Menu - No logo section */}
      <Box sx={{ flexGrow: 1, overflow: "auto", pt: 3 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNavigation(item.path);
                  }}
                  selected={isActive}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 2,
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                      boxShadow: theme.shadows[2],
                      "&:hover": {
                        backgroundColor: "primary.dark",
                        transform: "translateX(4px)",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "primary.contrastText",
                      },
                    },
                    "&:hover:not(.Mui-selected)": {
                      backgroundColor: "action.hover",
                      transform: "translateX(2px)",
                    },
                  }}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? "inherit" : "text.secondary",
                      transition: "color 0.2s ease-in-out",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.95rem",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: "block", mb: 0.5 }}
        >
          PlanIt v1.0
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Academic Planning Assistant
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
          // Remove onClick handler - let backdrop handle closing naturally
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width,
            transition: theme.transitions.create("transform", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width,
            border: "none",
            transition: theme.transitions.create("transform", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
