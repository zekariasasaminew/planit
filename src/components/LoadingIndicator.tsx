"use client";

import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Paper,
} from "@mui/material";

interface LoadingIndicatorProps {
  message?: string;
  progress?: number;
  variant?: "circular" | "linear" | "both";
  size?: "small" | "medium" | "large";
  showPaper?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Loading...",
  progress,
  variant = "circular",
  size = "medium",
  showPaper = false,
}) => {
  const getSizeValues = () => {
    switch (size) {
      case "small":
        return { circularSize: 20, fontSize: "0.875rem" };
      case "large":
        return { circularSize: 40, fontSize: "1.125rem" };
      default:
        return { circularSize: 24, fontSize: "1rem" };
    }
  };

  const { circularSize, fontSize } = getSizeValues();

  const renderContent = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        p: showPaper ? 3 : 0,
      }}
    >
      {/* Circular Progress */}
      {(variant === "circular" || variant === "both") && (
        <CircularProgress
          size={circularSize}
          {...(progress !== undefined && {
            variant: "determinate",
            value: progress,
          })}
        />
      )}

      {/* Message */}
      <Typography
        variant="body1"
        sx={{
          fontSize,
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        {message}
      </Typography>

      {/* Linear Progress */}
      {(variant === "linear" || variant === "both") && (
        <Box sx={{ width: "100%", maxWidth: 300 }}>
          <LinearProgress
            {...(progress !== undefined && {
              variant: "determinate",
              value: progress,
            })}
            sx={{ borderRadius: 1 }}
          />
          {progress !== undefined && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", mt: 0.5 }}
            >
              {Math.round(progress)}% Complete
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );

  if (showPaper) {
    return (
      <Paper
        sx={{
          bgcolor: "primary.light",
          color: "primary.contrastText",
        }}
      >
        {renderContent()}
      </Paper>
    );
  }

  return renderContent();
};
