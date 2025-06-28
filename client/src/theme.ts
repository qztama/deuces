import { createTheme, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        rank: {
            gold: string;
            silver: string;
            bronze: string;
        };
    }
    interface PaletteOptions {
        rank?: {
            gold: string;
            silver: string;
            bronze: string;
        };
    }
}

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                  // 🌞 Light Mode Palette
                  primary: {
                      main: '#6C6FAE',
                      contrastText: '#F4F5FA',
                  },
                  secondary: {
                      main: '#A3A8D1',
                      contrastText: '#2E2E3E',
                  },
                  background: {
                      default: '#F4F5FA',
                      paper: '#D8D7E7',
                  },
                  text: {
                      primary: '#2E2E3E',
                      secondary: '#6D6C80',
                  },
                  success: {
                      main: '#A6D6B2',
                  },
                  warning: {
                      main: '#C293C4',
                  },
                  info: {
                      main: '#B5D1E8',
                  },
                  error: {
                      main: '#B55F8E',
                  },
              }
            : {
                  // 🌙 Dark Mode Palette
                  primary: {
                      main: '#A3A8D1',
                      contrastText: '#1C1C2A',
                  },
                  secondary: {
                      main: '#6C6FAE',
                      contrastText: '#E5E5F2',
                  },
                  background: {
                      default: '#1C1C2A',
                      paper: '#2A2B3D',
                  },
                  text: {
                      primary: '#E5E5F2',
                      secondary: '#B3B3C8',
                  },
                  success: {
                      main: '#A6D6B2',
                  },
                  warning: {
                      main: '#C293C4',
                  },
                  info: {
                      main: '#B5D1E8',
                  },
                  error: {
                      main: '#D277A3',
                  },
              }),
        rank: {
            gold: '#E2C275',
            silver: '#D1D1D1',
            bronze: '#D9A066',
        },
    },
    typography: {
        fontFamily: `'Inter', 'Nunito', sans-serif`,
        h1: { fontWeight: 700 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 500 },
        body1: { fontSize: '1rem' },
        body2: { fontSize: '0.875rem' },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 10,
                },
            },
        },
    },
});

const getTheme = (mode: 'light' | 'dark') => createTheme(getDesignTokens(mode));

export default getTheme;
