"use client";

import React, { useState } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Box, Toolbar } from "@mui/material";
import { ThemeProvider } from "@/theme/context";
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

const DRAWER_WIDTH = 280;

function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <ThemeProvider>
      <Box sx={{ display: "flex" }}>
        {/* App Bar */}
        <AppBar
          open={sidebarOpen}
          onMenuToggle={handleSidebarToggle}
          drawerWidth={DRAWER_WIDTH}
        />

        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={handleSidebarClose}
          width={DRAWER_WIDTH}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
            minHeight: "100vh",
            bgcolor: "background.default",
            transition: (theme) =>
              theme.transitions.create("margin", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
          }}
        >
          {/* Toolbar spacer */}
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
