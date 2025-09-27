// Design system constants
export const DESIGN_TOKENS = {
  // Spacing scale following 8px grid system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // Standardized icon sizes
  iconSizes: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },

  // Typography scale
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },

  // Consistent border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },

  // Animation durations
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
} as const;

// Breakpoints (matching Material-UI defaults)
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export type SpacingKey = keyof typeof DESIGN_TOKENS.spacing;
export type IconSizeKey = keyof typeof DESIGN_TOKENS.iconSizes;
export type FontSizeKey = keyof typeof DESIGN_TOKENS.fontSize;
