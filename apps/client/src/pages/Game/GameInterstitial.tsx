import { Outlet } from 'react-router';
import { useWSContext } from './contexts/WSContext';

import { useRoomContext } from './contexts/RoomContext';
import { IdentifierSelectorDialog } from './components/IdentifierSelectorDialog';

export const GameInterstitial = () => {
    const { connectionStatus } = useWSContext();
    const { persona } = useRoomContext();

    if (connectionStatus === 'closed' || connectionStatus === 'error') {
        return <div>There was an error.</div>;
    }

    if (!persona) {
        return <IdentifierSelectorDialog />;
    }

    return <Outlet />;
};
