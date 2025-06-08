import { Box, useTheme, Typography, Link, Switch } from '@mui/material';
import Logo from '../assets/Logo.svg?react';

interface NavBarProps {
    mode: 'light' | 'dark';
    toggleTheme: () => void;
}

export const NavBar = ({ mode, toggleTheme }: NavBarProps) => {
    const theme = useTheme();

    return (
        <Box
            component="nav"
            sx={{
                bgcolor: theme.palette.mode === 'light' ? '#D8D7E7' : '#2A2B3D',
                color: theme.palette.mode === 'light' ? '#2E2E3E' : '#E5E5F2',
                borderBottom: '1px solid',
                borderColor:
                    theme.palette.mode === 'light' ? '#C5C4D6' : '#3D3F53',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
            }}
        >
            {/* Left content (e.g. logo) */}
            <Link href="/" underline="none" sx={{ display: 'inline-block' }}>
                <Box display="flex" gap={2} alignItems="center">
                    <Logo width="60px" height="60px" />
                    <Typography color="textPrimary" variant="h3">
                        Deuces
                    </Typography>
                </Box>
            </Link>
            <Switch
                value={mode === 'light'}
                onChange={toggleTheme}
                slotProps={{
                    input: {
                        'aria-label':
                            mode === 'light' ? 'Light Mode' : 'Dark Mode',
                    },
                }}
            />
        </Box>
    );
};
