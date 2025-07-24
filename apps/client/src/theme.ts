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

const getDesignTokens = (): ThemeOptions => ({
    palette: {
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
        rank: {
            gold: '#E2C275',
            silver: '#D1D1D1',
            bronze: '#D9A066',
        },
    },
    typography: {
        fontFamily: `'Inter', 'Nunito', sans-serif`,
        h1: { fontWeight: 600, fontSize: '32px' },
        h2: { fontWeight: 500, fontSize: '28px' },
        h3: { fontWeight: 400, fontSize: '24px' },
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

const getTheme = () => createTheme(getDesignTokens());

export default getTheme;
