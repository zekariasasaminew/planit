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
  Divider,
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
    router.push(path);
    onClose();
  };

  const drawerContent = (
    <Box
      sx={{ width, height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <AutoAwesome sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          PlanIt
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={pathname === item.path}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color:
                      pathname === item.path ? "inherit" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block" }}
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
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width,
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
