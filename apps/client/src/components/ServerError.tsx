import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export const ServerError: React.FC = () => {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            textAlign="center"
            padding="24px"
            gap={2}
        >
            <Typography variant="h4" component="h1" color="error">
                Server Error
            </Typography>

            <Typography variant="body1" maxWidth="500px">
                There was a problem connecting to the server. Please try again
                by refreshing the page.
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={handleRefresh}
                sx={{ mt: 2 }}
            >
                Refresh Page
            </Button>
        </Box>
    );
};
