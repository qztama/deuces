import { Box, Button, Typography } from '@mui/material';

import { ConnectedClient } from '.';
import { useGameContext } from './contexts/GameContext';
import { PlayerCard } from './components/PlayerCard';
import { useNavigate } from 'react-router';

interface RoomProps {
    clientId: string;
    roomCode: string;
    connectedClients: ConnectedClient[];
}

const Room = (props: RoomProps) => {
    const { clientId, roomCode, connectedClients } = props;
    const navigate = useNavigate();

    const playerCards = connectedClients.map((client) => {
        return (
            <PlayerCard
                key={`${client.id}`}
                name={`${client.name}`}
                isHost={client.isHost}
                isCurrentPlayer={client.id === clientId}
                connectionStatus={client.status}
            />
        );
    });
    const isHost = connectedClients.some(
        ({ id, isHost }) => id === clientId && isHost
    );

    const handleLeaveGame = () => {
        navigate('/');
    };

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
                {isHost && <Button>Start Game</Button>}
                <Button onClick={handleLeaveGame}>Leave Game</Button>
            </Box>
        </Box>
    );
};

export default Room;
