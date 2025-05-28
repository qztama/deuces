import { Box, Typography } from '@mui/material';

import { ConnectedClient } from '.';
import { PlayerCard } from './components/PlayerCard';

interface RoomProps {
    clientId: string;
    roomCode: string;
    connectedClients: ConnectedClient[];
}

const Room = (props: RoomProps) => {
    const { clientId, roomCode, connectedClients } = props;

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
            <Box border="1px solid black" borderRadius="4px" padding="8px">
                <Box display="flex">{playerCards}</Box>
            </Box>
        </Box>
    );
};

export default Room;
