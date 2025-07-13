import { useNavigate } from 'react-router';
import { Box, useTheme, Typography, Link, Button } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

import Logo from '../assets/Logo.svg?react';

interface NavBarProps {}

export const NavBar = (_props: NavBarProps) => {
    const theme = useTheme();
    const navigate = useNavigate();

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
            {/* logo */}
            <Link href="/" underline="none" sx={{ display: 'inline-block' }}>
                <Box display="flex" gap={2} alignItems="center">
                    <Logo width="60px" height="60px" />
                    <Typography color="textPrimary" variant="h3">
                        Deuces
                    </Typography>
                </Box>
            </Link>
            <Button
                onClick={() => {
                    navigate('/settings');
                }}
            >
                <SettingsIcon />
            </Button>
        </Box>
    );
};
