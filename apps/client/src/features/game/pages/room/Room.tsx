import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Typography } from '@mui/material';

import { PlayerCard } from './components/PlayerCard';
import { useWSContext } from '../../contexts/WSContext';
import { useRoomContext } from '../../contexts/RoomContext';

export const Room = () => {
    const { clientId, roomCode, connectedClients, isGameStarted, isGameOver } =
        useRoomContext();
    const navigate = useNavigate();
    const { sendMessage } = useWSContext();

    useEffect(() => {
        if (isGameStarted && !isGameOver) {
            // automatically navigate player to the game if the game is in progress
            navigate('game');
        }
    }, [isGameStarted, isGameOver]);

    const playerCards = connectedClients.map((client) => {
        return (
            <PlayerCard
                key={`${client.id}`}
                name={`${client.name}`}
                isHost={client.isHost}
                isReady={client.isReady}
                isCurrentPlayer={client.id === clientId}
                connectionStatus={client.status}
            />
        );
    });
    const ownClientInfo = connectedClients.find((p) => p.id === clientId);

    const handleStartGame = () => sendMessage('start-game');
    const handleReadyToggle = () => {
        sendMessage('set-ready', { isReady: !ownClientInfo?.isReady });
    };
    const handleLeaveGame = () => navigate('/');

    return (
        <Box width="100%" height="100%">
            <Box
                display="flex"
                paddingBottom="8px"
                justifyContent="space-between"
            >
                <Typography fontSize="32px">
                    3P Deuces Room: {roomCode}
                </Typography>
                <Typography fontSize="32px">
                    {connectedClients.length} / 3
                </Typography>
            </Box>
            <Box display="flex" gap={2}>
                {playerCards}
            </Box>
            <Box display="flex" gap="16px" paddingTop="8px">
                {ownClientInfo?.isHost ? (
                    <Button variant="outlined" onClick={handleStartGame}>
                        Start Game
                    </Button>
                ) : (
                    <Button variant="outlined" onClick={handleReadyToggle}>
                        {!ownClientInfo?.isReady ? 'Ready' : 'Unready'}
                    </Button>
                )}
                <Button variant="outlined" onClick={handleLeaveGame}>
                    Leave Game
                </Button>
            </Box>
        </Box>
    );
};
