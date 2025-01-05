import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    accent?: PaletteOptions['primary'];
  }
}

const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.00735em',
    },
    button: {
      textTransform: 'none' as const,
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A4D3C', // Dark green from logo
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#0A4D3C', // Dark green from logo
      light: '#1A6E59',
      dark: '#073D30',
    },
    secondary: {
      main: '#D4AF37', // Gold from logo
      light: '#E0C158',
      dark: '#B39329',
    },
    tertiary: {
      main: '#8B7355', // Complementary brown
      light: '#A38B6B',
      dark: '#725E45',
    },
    accent: {
      main: '#C17817', // Complementary orange
      light: '#D68F2E',
      dark: '#9E6213',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2027',
      secondary: '#4A5568',
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#0A4D3C', // Dark green from logo
      light: '#1A6E59',
      dark: '#073D30',
    },
    secondary: {
      main: '#D4AF37', // Gold from logo
      light: '#E0C158',
      dark: '#B39329',
    },
    tertiary: {
      main: '#8B7355', // Complementary brown
      light: '#A38B6B',
      dark: '#725E45',
    },
    accent: {
      main: '#C17817', // Complementary orange
      light: '#D68F2E',
      dark: '#9E6213',
    },
    background: {
      default: '#0F1A17', // Very dark green
      paper: '#162922', // Dark green background
    },
    text: {
      primary: '#F7FAFC',
      secondary: '#CBD5E0',
    },
  },
});

export const getThemedAlpha = (theme: any, alpha: number) => {
  return theme.palette.mode === 'light'
    ? `rgba(0, 0, 0, ${alpha})`
    : `rgba(255, 255, 255, ${alpha})`;
};

export const getThemedElevation = (theme: any, level: number) => {
  const alphaValue = level * 0.02;
  return `0px ${level * 2}px ${level * 4}px ${getThemedAlpha(theme, alphaValue)}`;
};
