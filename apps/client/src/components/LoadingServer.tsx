import { Box, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export const LoadingServer: React.FC<{ message?: string }> = ({
    message = 'Starting up the server...',
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                bgcolor: 'background.default',
                color: 'text.primary',
                p: 2,
                gap: 2,
            }}
        >
            {/* Cog container */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <SettingsIcon
                    sx={{
                        fontSize: 60,
                        animation: 'spin 2s linear infinite',
                        '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                        },
                    }}
                />
            </Box>

            {/* Message */}
            <Typography fontSize="24px" textAlign="center">
                {message}
            </Typography>
        </Box>
    );
};
