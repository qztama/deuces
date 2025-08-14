import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ServerErrorProps {
    message?: string;
    onRetry?: () => void;
}

export const ServerError: React.FC<ServerErrorProps> = ({
    message = 'An unexpected error occurred. Please refresh the page to try again.',
    onRetry,
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 2,
                bgcolor: 'background.default',
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                There was a server error
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
            </Typography>
            {onRetry && (
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={onRetry}
                >
                    Retry
                </Button>
            )}
        </Box>
    );
};
