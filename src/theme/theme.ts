import { createTheme } from "@mui/material/styles";

// Standardized spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Standardized icon sizes
export const iconSizes = {
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 48,
} as const;

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#E68057",
      light: "#FFF5F0",
      dark: "#A2574F",
    },
    secondary: {
      main: "#BF7587",
      light: "#E68057",
      dark: "#993A8B",
    },
    background: {
      default: "#FDF8F6",
      paper: "#FAF5F2",
    },
    text: {
      primary: "#4A2B2A",
      secondary: "#A2574F",
    },
    success: {
      main: "#BF7587",
      light: "#FFF5F0",
      dark: "#993A8B",
    },
    error: {
      main: "#d32f2f",
      light: "#ffcdd2",
      dark: "#c62828",
    },
    warning: {
      main: "#ed6c02",
      light: "#fff3e0",
      dark: "#e65100",
    },
    info: {
      main: "#0288d1",
      light: "#e3f2fd",
      dark: "#01579b",
    },
  },
  typography: {
    fontSize: 14,
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      "@media (max-width:600px)": {
        fontSize: "2rem",
      },
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
      "@media (max-width:600px)": {
        fontSize: "1.75rem",
      },
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.4,
      "@media (max-width:600px)": {
        fontSize: "1.5rem",
      },
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 500,
      textTransform: "none" as const,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: spacing.sm,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: spacing.sm,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: spacing.xl,
          height: spacing.xl,
          fontSize: "1rem",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 28,
          fontSize: "0.8125rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: spacing.md,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: spacing.md,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: spacing.md,
          "&:last-child": {
            paddingBottom: spacing.md,
          },
        },
      },
    },
  },
});
