"use client";

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useTheme } from "@/theme/context";

export const ThemeToggle: React.FC = () => {
  const { mode, toggleMode } = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
        sx={{
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "rotate(15deg) scale(1.1)",
          },
        }}
      >
        {mode === "light" ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};
