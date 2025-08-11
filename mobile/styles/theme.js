// Contemporary News App Theme with Fluorescent Green
export const theme = {
  colors: {
    // Primary fluorescent green palette
    primary: '#00FF88',           // Bright fluorescent green
    primaryDark: '#00E67A',       // Darker fluorescent green
    primaryLight: '#33FF99',      // Lighter fluorescent green
    primaryGlow: '#00FF8833',     // Transparent glow effect
    
    // Secondary colors
    secondary: '#FF6B6B',         // Coral red for accents
    accent: '#4ECDC4',            // Teal for highlights
    warning: '#FFE66D',           // Bright yellow
    
    // Neutral colors
    background: '#0A0A0B',        // Deep black background
    surface: '#1A1A1D',          // Dark surface
    surfaceLight: '#2D2D30',     // Lighter surface
    card: '#1E1E22',             // Card background
    surfaceUltraLight: '#18181A', // Ultra light for dark mode
    
    // Text colors
    text: '#FFFFFF',             // Primary text (white)
    textSecondary: '#B0B0B0',    // Secondary text (light gray)
    textMuted: '#808080',        // Muted text
    textInverse: '#0A0A0B',      // Inverse text (black on light)
    
    // Status colors
    success: '#00FF88',          // Same as primary
    error: '#FF4757',            // Red error
    info: '#3742FA',             // Blue info
    
    // Gradients
    gradientPrimary: ['#00FF88', '#00E67A'],
    gradientSecondary: ['#FF6B6B', '#FF8E8E'],
    gradientDark: ['#1A1A1D', '#0A0A0B'],
    gradientCard: ['#1E1E22', '#2D2D30'],
  },
  
  typography: {
    // Font families
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      black: 'System',
    },
    
    // Font sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    
    // Font weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#00FF88',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#00FF88',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#00FF88',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    glow: {
      shadowColor: '#00FF88',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },

  // Add fonts object for compatibility with react-native-paper and similar libraries
  fonts: {
    regular: { fontFamily: 'Roboto-Regular', fontWeight: 'normal' },
    medium: { fontFamily: 'Roboto-Medium', fontWeight: 'normal' },
    light: { fontFamily: 'Roboto-Light', fontWeight: '300' },
    thin: { fontFamily: 'Roboto-Thin', fontWeight: '100' },
    bold: { fontFamily: 'Roboto-Bold', fontWeight: 'bold' },
    // MD3 keys for react-native-paper v5
    bodyLarge: { fontFamily: 'Roboto-Regular', fontSize: 16, fontWeight: '400', letterSpacing: 0.15, lineHeight: 24 },
    bodyMedium: { fontFamily: 'Roboto-Regular', fontSize: 14, fontWeight: '400', letterSpacing: 0.25, lineHeight: 20 },
    bodySmall: { fontFamily: 'Roboto-Regular', fontSize: 12, fontWeight: '400', letterSpacing: 0.4, lineHeight: 16 },
    displayLarge: { fontFamily: 'Roboto-Regular', fontSize: 57, fontWeight: '400', letterSpacing: 0, lineHeight: 64 },
    displayMedium: { fontFamily: 'Roboto-Regular', fontSize: 45, fontWeight: '400', letterSpacing: 0, lineHeight: 52 },
    displaySmall: { fontFamily: 'Roboto-Regular', fontSize: 36, fontWeight: '400', letterSpacing: 0, lineHeight: 44 },
    headlineLarge: { fontFamily: 'Roboto-Bold', fontSize: 32, fontWeight: '700', letterSpacing: 0, lineHeight: 40 },
    headlineMedium: { fontFamily: 'Roboto-Bold', fontSize: 28, fontWeight: '700', letterSpacing: 0, lineHeight: 36 },
    headlineSmall: { fontFamily: 'Roboto-Bold', fontSize: 24, fontWeight: '700', letterSpacing: 0, lineHeight: 32 },
    labelLarge: { fontFamily: 'Roboto-Medium', fontSize: 14, fontWeight: '500', letterSpacing: 0.1, lineHeight: 20 },
    labelMedium: { fontFamily: 'Roboto-Medium', fontSize: 12, fontWeight: '500', letterSpacing: 0.5, lineHeight: 16 },
    labelSmall: { fontFamily: 'Roboto-Medium', fontSize: 11, fontWeight: '500', letterSpacing: 0.5, lineHeight: 16 },
    titleLarge: { fontFamily: 'Roboto-Bold', fontSize: 22, fontWeight: '700', letterSpacing: 0, lineHeight: 28 },
    titleMedium: { fontFamily: 'Roboto-Medium', fontSize: 16, fontWeight: '500', letterSpacing: 0.15, lineHeight: 24 },
    titleSmall: { fontFamily: 'Roboto-Medium', fontSize: 14, fontWeight: '500', letterSpacing: 0.1, lineHeight: 20 },
  },
};

export const themeLight = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#FFFFFF',        // White background for light mode
    surface: '#E5E5E5',           // More contrast for cards/inputs
    surfaceLight: '#CCCCCC',      // Even more contrast for borders
    card: '#FAFAFA',              // Card background
    surfaceUltraLight: '#F7F7F7', // Ultra light for light mode
    text: '#181A20',              // Very dark text for contrast
    textSecondary: '#333333',     // Darker secondary text
    textMuted: '#888888',         // Muted text
    textInverse: '#FFFFFF',       // Inverse text (white on dark)
    primary: '#00B86B', // Slightly less neon for light
    primaryDark: '#00995A',
    primaryLight: '#33FF99',
    primaryGlow: '#00FF8833',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    warning: '#FFD600',
    success: '#00B86B',
    error: '#FF4757',
    info: '#3742FA',
    gradientPrimary: ['#00B86B', '#00995A'],
    gradientSecondary: ['#FF6B6B', '#FF8E8E'],
    gradientDark: ['#F5F5F5', '#FFFFFF'],
    gradientCard: ['#FAFAFA', '#E0E0E0'],
  },
};