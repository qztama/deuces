import { Outlet } from 'react-router';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useWSContext } from '../contexts/WSContext';
import { useRoomContext } from '../contexts/RoomContext';
import { PersonaSelectorDialog } from './PersonaSelectorDialog';

export const GameInterstitial = () => {
    const { connectionStatus } = useWSContext();
    const { persona, connectedClients } = useRoomContext();

    if (!persona) {
        return <PersonaSelectorDialog />;
    }

    if (connectionStatus === 'closed' || connectionStatus === 'error') {
        return <ConnectionError />;
    }

    if (connectionStatus === 'connecting' || connectedClients.length === 0) {
        return <LoadingScreen />;
    }

    return <Outlet />;
};

const ConnectionError = () => {
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
                Connection Error
            </Typography>

            <Typography variant="body1" maxWidth="500px">
                There was a problem connecting to the game room. Please make
                sure the room code is correct and that the room is still active.
            </Typography>

            <Typography variant="body1" maxWidth="500px">
                To try again, refresh the page.
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

const LoadingScreen = ({
    message = 'Connecting to room...',
}: {
    message?: string;
}) => {
    return (
        <Box
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={3}
            textAlign="center"
        >
            <CircularProgress size={60} thickness={5} />

            <Typography variant="h6">{message}</Typography>
        </Box>
    );
};
