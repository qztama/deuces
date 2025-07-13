import { Outlet } from 'react-router';
import { Toaster } from 'react-hot-toast';

import { WSContextProvider } from '../contexts/WSContext';
import { RoomContextProvider } from '../contexts/RoomContext';

export const GameLayout = () => {
    return (
        <WSContextProvider>
            <RoomContextProvider>
                <>
                    <Toaster position="bottom-center" />
                    <Outlet />
                </>
            </RoomContextProvider>
        </WSContextProvider>
    );
};
