import { Box } from '@mui/material';

import { ConnectedClient } from '.';

interface RoomProps {
    clientId: string;
    connectedClients: ConnectedClient[];
}

const Room = (props: RoomProps) => {
    const { clientId, connectedClients } = props;

    return (
        <Box width="100%" height="100%">
            <h1>Room</h1>
            <h2>Client Id {clientId}</h2>
            <h2>Connected Client</h2>
            <pre>{JSON.stringify(connectedClients)}</pre>
        </Box>
    );
};

export default Room;
