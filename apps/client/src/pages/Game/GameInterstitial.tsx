import { Outlet } from 'react-router';
import { useRoomContext } from './contexts/RoomContext';
import { useWSContext } from './contexts/WSContext';

export const GameInterstitial = () => {
    const { connectionStatus } = useWSContext();
    const { connectedClients } = useRoomContext();

    if (connectionStatus === 'closed' || connectionStatus === 'error') {
        return <div>There was an error.</div>;
    }

    if (!connectedClients.length) {
        return <div>Connecting to room...</div>;
    }

    return <Outlet />;
};
