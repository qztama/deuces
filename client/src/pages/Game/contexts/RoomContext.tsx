import { createContext, useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router';
import { useWSContext } from './WSContext';

interface ConnectedClient {
    id: string;
    name: string;
    isHost: boolean;
    status: 'connected' | 'disconnected';
}

interface RoomContextValue {
    roomCode: string;
    clientId: string;
    connectedClients: ConnectedClient[];
    isGameStarted: boolean;
}

const RoomContext = createContext<RoomContextValue | null>(null);

function getRoomClientLSK(roomCode: string) {
    return `${roomCode}-client-id`;
}

export const RoomContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { roomCode } = useParams<{ roomCode: string }>();
    const { socket, subscribe, sendMessage } = useWSContext();

    const [clientId, setClientId] = useState<string>(() => {
        if (!roomCode) {
            return '';
        }
        return localStorage.getItem(getRoomClientLSK(roomCode)) ?? '';
    });
    const [connectedClients, setConnectedClients] = useState<ConnectedClient[]>(
        []
    );
    const [isGameStarted, setIsGameStarted] = useState(false);

    if (!roomCode) {
        throw new Error('Invalid room code');
    }

    useEffect(() => {
        if (!socket) return;

        let unsubscribeRoomUpdated: (() => void) | null = null;

        const tryJoin = () => {
            unsubscribeRoomUpdated = subscribe('room-updated', (payload) => {
                localStorage.setItem(
                    getRoomClientLSK(roomCode),
                    payload.clientId
                );
                setClientId(payload.clientId);
                setConnectedClients(payload.room.connectedClients);
                setIsGameStarted(payload.isGameStarted);
            });

            sendMessage('join', { roomCode: roomCode!, clientId });
        };

        if (socket.readyState === WebSocket.OPEN) {
            console.log('Websocket is ready...');
            tryJoin();
        } else {
            socket.addEventListener('open', tryJoin, { once: true });
            return () => socket.removeEventListener('open', tryJoin);
        }

        return () => {
            if (unsubscribeRoomUpdated) {
                unsubscribeRoomUpdated();
            }
            socket.removeEventListener('open', tryJoin);
        };
    }, [socket]);

    return (
        <RoomContext.Provider
            value={{ roomCode, clientId, connectedClients, isGameStarted }}
        >
            {children}
        </RoomContext.Provider>
    );
};

export const useRoomContext = () => {
    const ctx = useContext(RoomContext);
    if (!ctx) {
        throw new Error('useRoomContext must be used within the provider');
    }
    return ctx;
};
