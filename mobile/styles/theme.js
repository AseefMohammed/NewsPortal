// Classic warm palette for NewsPortal mobile
const palette = {
  buff: '#cb997e',
  desertSand: '#ddbea9',
  champagnePink: '#ffe8d6',
  ashGray: '#b7b7a4',
  sage: '#a5a58d',
  resedaGreen: '#6b705c',
};

export const theme = {
  colors: {
    // Use the provided palette mapped to semantic names
    primary: palette.resedaGreen,
    primaryDark: '#595a4e',
    primaryLight: palette.sage,
    surface: palette.champagnePink,
    background: palette.buff,
    card: palette.desertSand,
    text: '#2b2b2b',
    textSecondary: '#5b5b5b',
    textMuted: '#7a7a71',
    accent: palette.sage,
    success: palette.resedaGreen,
    error: '#9b2c2c',
    info: '#6b7c5c',
    // gentle gradients
    gradientPrimary: [palette.buff, palette.desertSand],
    gradientCard: [palette.champagnePink, palette.ashGray],
    surfaceUltraLight: palette.champagnePink,
  },

  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      bold: '700',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },

  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
  },

  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
  },
};

export const themeLight = {
  ...theme,
  colors: {
    ...theme.colors,
    background: palette.champagnePink,
    surface: palette.desertSand,
    card: palette.buff,
    text: '#2b2b2b',
    textSecondary: '#5b5b5b',
  },
};