import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#E68057", // Warm orange
      light: "#FFF5F0", // Very light peach/cream
      dark: "#A2574F", // Reddish brown
    },
    secondary: {
      main: "#BF7587", // Muted rose/mauve
      light: "#E68057", // Warm orange
      dark: "#993A8B", // Deep purple
    },
    background: {
      default: "#FDF8F6", // Very light warm beige background
      paper: "#FAF5F2", // Slightly warmer light beige for cards
    },
    text: {
      primary: "#4A2B2A", // Very dark warm brown for text
      secondary: "#A2574F", // Reddish brown for secondary text
    },
    success: {
      main: "#BF7587",
      light: "#FFF5F0",
      dark: "#993A8B",
    },
  },
  typography: {
    // Set reasonable base font size
    fontSize: 14,
    // Normalize heading sizes
    h1: {
      fontSize: "2.5rem", // Much smaller than 6rem
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
          padding: "8px 16px",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: "8px",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: "32px",
          height: "32px",
          fontSize: "1rem",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: "28px", // Smaller chips
          fontSize: "0.8125rem",
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
          paddingTop: "8px",
          paddingBottom: "8px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          padding: "16px", // Normalize card padding
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "16px",
          "&:last-child": {
            paddingBottom: "16px",
          },
        },
      },
    },
  },
});
