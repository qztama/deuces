import { createContext, useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router';

import { SettingsSchema } from '@/utils/settings/schema';
import { loadSettingsFromLS } from '@/utils/settings/settings';
import { useWSContext } from './WSContext';

interface ConnectedClient {
    id: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
    status: 'connected' | 'disconnected';
}

type Persona = Pick<SettingsSchema, 'avatar' | 'name'> | null;

interface RoomContextValue {
    roomCode: string;
    clientId: string;
    persona: Persona;
    connectedClients: ConnectedClient[];
    isGameStarted: boolean;
    isGameOver: boolean;
    setPersona: React.Dispatch<React.SetStateAction<Persona>>;
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

    const [persona, setPersona] = useState<Persona>(() => {
        const settings = loadSettingsFromLS();
        if (!settings.avatar || !settings.name) {
            return null;
        }

        return { avatar: settings.avatar, name: settings.name };
    });
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
    const [isGameOver, setIsGameOver] = useState(false);

    if (!roomCode) {
        throw new Error('Invalid room code');
    }

    useEffect(() => {
        if (!socket) return;

        let unsubscribeRoomUpdated: (() => void) | null = null;

        const tryJoin = () => {
            if (!persona?.name || !persona?.avatar) {
                return;
            }
            unsubscribeRoomUpdated = subscribe('room-updated', (payload) => {
                localStorage.setItem(
                    getRoomClientLSK(roomCode),
                    payload.clientId
                );
                setClientId(payload.clientId);
                setConnectedClients(payload.room.connectedClients);
                setIsGameStarted(payload.room.isGameStarted);
                setIsGameOver(payload.room.isGameOver);
            });

            sendMessage('join', {
                roomCode: roomCode!,
                clientId,
                name: persona.name,
                avatar: persona.avatar,
            });
        };

        if (socket.readyState === WebSocket.OPEN) {
            console.log('Websocket is ready...');
            tryJoin();
        } else {
            socket.addEventListener('open', tryJoin, { once: true });
        }

        return () => {
            if (unsubscribeRoomUpdated) {
                unsubscribeRoomUpdated();
            }
            socket.removeEventListener('open', tryJoin);
        };
    }, [socket, persona]);

    return (
        <RoomContext.Provider
            value={{
                roomCode,
                clientId,
                persona,
                connectedClients,
                isGameStarted,
                isGameOver,
                setPersona,
            }}
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
