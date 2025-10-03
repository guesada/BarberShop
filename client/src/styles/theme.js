// Design System - BarberShop Enterprise Theme
// Based on Figma design with professional color palette

// Base colors from Figma design
const figmaColors = {
  // Primary browns (from Figma)
  primaryDark: '#2D2720',
  secondaryDark: '#3A322A',
  tertiaryDark: '#483E34',
  
  // Orange accents (from Figma)
  primaryOrange: '#FF6B35',
  secondaryOrange: '#FF5722',
  accentOrange: '#FF8A65',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Professional colors
  professional: {
    gold: '#D4AF37',
    darkGold: '#B8860B',
    lightGold: '#FFD700',
    charcoal: '#36454F',
    slate: '#708090',
    cream: '#F5F5DC',
  },
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Semantic colors
  online: '#4CAF50',
  offline: '#9E9E9E',
  busy: '#FF9800',
  away: '#FF5722',
};

// Typography system
const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    secondary: "'Playfair Display', Georgia, serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Spacing system (8px grid)
const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
};

// Border radius system
const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Shadow system
const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  professional: '0 4px 12px rgba(0, 0, 0, 0.15)',
  professionalHover: '0 8px 24px rgba(0, 0, 0, 0.2)',
  orange: '0 4px 12px rgba(255, 107, 53, 0.3)',
  orangeHover: '0 8px 24px rgba(255, 107, 53, 0.4)',
};

// Breakpoints
const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultrawide: '1440px',
};

// Z-index scale
const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Animation system
const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    professional: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// Light Theme
export const lightTheme = {
  name: 'light',
  colors: {
    // Primary colors
    primary: {
      50: '#FFF3E0',
      100: '#FFE0B2',
      200: '#FFCC80',
      300: '#FFB74D',
      400: '#FFA726',
      500: figmaColors.primaryOrange,
      600: figmaColors.secondaryOrange,
      700: '#E64A19',
      800: '#D84315',
      900: '#BF360C',
    },
    
    // Background colors
    background: {
      primary: figmaColors.white,
      secondary: figmaColors.gray[50],
      tertiary: figmaColors.gray[100],
      elevated: figmaColors.white,
      overlay: 'rgba(0, 0, 0, 0.5)',
      glass: 'rgba(255, 255, 255, 0.8)',
    },
    
    // Text colors
    text: {
      primary: figmaColors.gray[900],
      secondary: figmaColors.gray[700],
      tertiary: figmaColors.gray[500],
      inverse: figmaColors.white,
      accent: figmaColors.primaryOrange,
      muted: figmaColors.gray[400],
    },
    
    // Border colors
    border: {
      primary: figmaColors.gray[200],
      secondary: figmaColors.gray[300],
      accent: figmaColors.primaryOrange,
      focus: figmaColors.primaryOrange,
    },
    
    // Status colors
    status: {
      success: figmaColors.success,
      warning: figmaColors.warning,
      error: figmaColors.error,
      info: figmaColors.info,
    },
    
    // Professional colors
    professional: figmaColors.professional,
    
    // Figma specific colors
    figma: figmaColors,
  },
  
  // Component specific colors
  components: {
    button: {
      primary: {
        background: figmaColors.primaryOrange,
        backgroundHover: figmaColors.secondaryOrange,
        text: figmaColors.white,
        border: figmaColors.primaryOrange,
      },
      secondary: {
        background: 'transparent',
        backgroundHover: figmaColors.gray[100],
        text: figmaColors.primaryOrange,
        border: figmaColors.primaryOrange,
      },
      ghost: {
        background: 'transparent',
        backgroundHover: figmaColors.gray[100],
        text: figmaColors.gray[700],
        border: 'transparent',
      },
    },
    card: {
      background: figmaColors.white,
      border: figmaColors.gray[200],
      shadow: shadows.base,
    },
    input: {
      background: figmaColors.white,
      backgroundFocus: figmaColors.white,
      border: figmaColors.gray[300],
      borderFocus: figmaColors.primaryOrange,
      text: figmaColors.gray[900],
      placeholder: figmaColors.gray[500],
    },
  },
  
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  zIndex,
  animations,
};

// Dark Theme
export const darkTheme = {
  name: 'dark',
  colors: {
    // Primary colors (same as light)
    primary: lightTheme.colors.primary,
    
    // Background colors (Figma browns)
    background: {
      primary: figmaColors.primaryDark,
      secondary: figmaColors.secondaryDark,
      tertiary: figmaColors.tertiaryDark,
      elevated: figmaColors.secondaryDark,
      overlay: 'rgba(0, 0, 0, 0.7)',
      glass: 'rgba(45, 39, 32, 0.8)',
    },
    
    // Text colors
    text: {
      primary: figmaColors.white,
      secondary: figmaColors.gray[300],
      tertiary: figmaColors.gray[400],
      inverse: figmaColors.gray[900],
      accent: figmaColors.primaryOrange,
      muted: figmaColors.gray[500],
    },
    
    // Border colors
    border: {
      primary: figmaColors.gray[700],
      secondary: figmaColors.gray[600],
      accent: figmaColors.primaryOrange,
      focus: figmaColors.primaryOrange,
    },
    
    // Status colors
    status: {
      success: '#66BB6A',
      warning: '#FFB74D',
      error: '#EF5350',
      info: '#42A5F5',
    },
    
    // Professional colors
    professional: figmaColors.professional,
    
    // Figma specific colors
    figma: figmaColors,
  },
  
  // Component specific colors
  components: {
    button: {
      primary: {
        background: figmaColors.primaryOrange,
        backgroundHover: figmaColors.secondaryOrange,
        text: figmaColors.white,
        border: figmaColors.primaryOrange,
      },
      secondary: {
        background: 'transparent',
        backgroundHover: figmaColors.tertiaryDark,
        text: figmaColors.primaryOrange,
        border: figmaColors.primaryOrange,
      },
      ghost: {
        background: 'transparent',
        backgroundHover: figmaColors.tertiaryDark,
        text: figmaColors.gray[300],
        border: 'transparent',
      },
    },
    card: {
      background: figmaColors.secondaryDark,
      border: figmaColors.gray[700],
      shadow: shadows.lg,
    },
    input: {
      background: figmaColors.tertiaryDark,
      backgroundFocus: figmaColors.tertiaryDark,
      border: figmaColors.gray[600],
      borderFocus: figmaColors.primaryOrange,
      text: figmaColors.white,
      placeholder: figmaColors.gray[400],
    },
  },
  
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  zIndex,
  animations,
};

// Theme utilities
export const getTheme = (themeName) => {
  switch (themeName) {
    case 'light':
      return lightTheme;
    case 'dark':
      return darkTheme;
    default:
      return darkTheme; // Default to dark theme
  }
};

// Media queries helper
export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (max-width: ${breakpoints.desktop})`,
  wide: `@media (max-width: ${breakpoints.wide})`,
  ultrawide: `@media (max-width: ${breakpoints.ultrawide})`,
  
  // Min-width queries
  mobileUp: `@media (min-width: ${breakpoints.mobile})`,
  tabletUp: `@media (min-width: ${breakpoints.tablet})`,
  desktopUp: `@media (min-width: ${breakpoints.desktop})`,
  wideUp: `@media (min-width: ${breakpoints.wide})`,
  ultrawideUp: `@media (min-width: ${breakpoints.ultrawide})`,
  
  // Specific ranges
  mobileOnly: `@media (max-width: ${breakpoints.tablet})`,
  tabletOnly: `@media (min-width: ${breakpoints.mobile}) and (max-width: ${breakpoints.desktop})`,
  desktopOnly: `@media (min-width: ${breakpoints.desktop})`,
};

// Color utilities
export const colorUtils = {
  // Add alpha to any color
  alpha: (color, alpha) => {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  },
  
  // Lighten a color
  lighten: (color, amount) => {
    // This would need a color manipulation library in a real implementation
    return color;
  },
  
  // Darken a color
  darken: (color, amount) => {
    // This would need a color manipulation library in a real implementation
    return color;
  },
};

// Animation presets
export const animationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: { 
      duration: 0.5, 
      ease: 'easeOut',
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  
  professional: {
    initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -20, filter: 'blur(4px)' },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

export default {
  light: lightTheme,
  dark: darkTheme,
  getTheme,
  mediaQueries,
  colorUtils,
  animationPresets,
};
