import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Typography, useTheme } from '@mui/material';

import { RoomClientCard } from './components/RoomClientCard';
import { useWSContext } from '../../contexts/WSContext';
import { useRoomContext } from '../../contexts/RoomContext';
import { RoomClientCardEmpty } from './components/RoomClientCardEmpty';

const NUM_OF_PLAYERS = 3;

export const Room = () => {
    const { palette } = useTheme();

    const { sendMessage } = useWSContext();
    const { clientId, roomCode, connectedClients, isGameStarted, isGameOver } =
        useRoomContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (isGameStarted && !isGameOver) {
            // automatically navigate player to the game if the game is in progress
            navigate('game');
        }
    }, [isGameStarted, isGameOver]);

    const roomClientCards = Array.from({ length: NUM_OF_PLAYERS }).map(
        (_, idx) => {
            if (idx < connectedClients.length) {
                const client = connectedClients[idx];
                return (
                    <RoomClientCard
                        key={`${client.id}`}
                        name={`${client.name}`}
                        avatar={`${client.avatar}`}
                        isHost={client.isHost}
                        isReady={client.isReady}
                        isCurrentPlayer={client.id === clientId}
                    />
                );
            } else {
                return (
                    <RoomClientCardEmpty
                        key={`room-client-card-empty-${idx}`}
                    />
                );
            }
        }
    );
    const ownClientInfo = connectedClients.find((p) => p.id === clientId);

    const handleStartGame = () => sendMessage('start-game');
    const handleReadyToggle = () => {
        sendMessage('set-ready', { isReady: !ownClientInfo?.isReady });
    };
    const handleLeaveGame = () => navigate('/');

    return (
        <Box
            width="100%"
            height="100%"
            display="flex"
            flexDirection="column"
            // justifyContent="center"
            alignItems="center"
            paddingTop="100px"
        >
            <Typography fontSize="32px" marginBottom="8px" width="fit-content">
                3P Deuces Room
            </Typography>
            <Box
                position="relative"
                display="flex"
                flexDirection="column"
                borderRadius="24px"
                paddingX="16px"
                paddingTop="16px"
                paddingBottom="32px"
                border={`1px solid ${palette.primary.main}`}
                gap="16px"
                sx={{ width: 'fit-content' }}
            >
                <Box display="flex" justifyContent="space-between">
                    <Typography fontSize="24px">Code: {roomCode}</Typography>
                    <Typography fontSize="24px">
                        {connectedClients.length} / {NUM_OF_PLAYERS}
                    </Typography>
                </Box>
                {roomClientCards}
                <Box
                    display="flex"
                    justifyContent="center"
                    gap="16px"
                    paddingTop="8px"
                    bottom="-16px"
                    position="absolute"
                    sx={{
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                >
                    {ownClientInfo?.isHost ? (
                        <Button
                            variant="outlined"
                            onClick={handleStartGame}
                            sx={{ bgcolor: palette.background.default }}
                        >
                            Start
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            onClick={handleReadyToggle}
                            sx={{ bgcolor: palette.background.default }}
                        >
                            {!ownClientInfo?.isReady ? 'Ready' : 'Unready'}
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        onClick={handleLeaveGame}
                        sx={{ bgcolor: palette.background.default }}
                    >
                        Leave
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
