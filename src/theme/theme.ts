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
});
