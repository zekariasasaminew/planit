"use client";

import React, { useState, useCallback } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { ThemeProvider } from "@/theme/context";
import { AuthProvider } from "@/app/context/authContext";
import { useAuth } from "@/app/context/authContext";
import { AppBar } from "@/components/AppBar";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleRouteChange = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        open={sidebarOpen}
        onMenuToggle={handleSidebarToggle}
        drawerWidth={280}
        isMobile={isMobile}
      />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        onRouteChange={handleRouteChange}
        width={280}
        isMobile={isMobile}
      />

      {/* Backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: theme.zIndex.drawer - 1,
          }}
          onClick={handleSidebarClose}
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: {
            xs: "100%",
            md: sidebarOpen ? `calc(100% - 280px)` : "100%",
          },
          minHeight: "100vh",
          bgcolor: "background.default",
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen &&
            !isMobile && {
              marginLeft: 280,
              width: `calc(100% - 280px)`,
              transition: theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }),
        }}
      >
        {/* Toolbar spacer */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Don't show navigation for signin page
  const isSignInPage = pathname === "/signin";

  // Show authenticated layout for logged in users (except signin page)
  const showAuthenticatedLayout = user && !isSignInPage;

  if (showAuthenticatedLayout) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  }

  // Show minimal layout for non-authenticated users or signin page
  return children;
}

function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PlanIt - Academic Planning Assistant</title>
        <meta
          name="description"
          content="Modern academic planning web app for college students"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
