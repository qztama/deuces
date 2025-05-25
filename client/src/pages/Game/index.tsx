import { useState, useEffect } from 'react';
import { useParams } from 'react-router';

import { GameContextProvider, useGameContext } from './contexts/GameContext';
import Room from './Room';

export interface ConnectedClient {
    id: string;
    name: string;
    isHost: boolean;
    status: 'connected' | 'disconnected';
}

function getRoomClientLSK(roomCode: string) {
    return `${roomCode}-client-id`;
}

const GameRoom = () => {
    return (
        <GameContextProvider>
            <GameRoomContent />
        </GameContextProvider>
    );
};

const GameRoomContent = () => {
    const { socket, connectionStatus, subscribe, sendMessage } =
        useGameContext();
    const { roomCode } = useParams<{ roomCode: string }>();
    const [isGameStarted, setIsGameStarted] = useState(false);

    const [clientId, setClientId] = useState(() => {
        if (!roomCode) {
            return '';
        }
        return localStorage.getItem(getRoomClientLSK(roomCode)) ?? '';
    });
    const [connectedClients, setConnectedClients] = useState<ConnectedClient[]>(
        []
    );
    console.log(isGameStarted);

    useEffect(() => {
        if (!socket) return;

        const tryJoin = () => {
            const unsubscribeJoined = subscribe('joined', (payload) => {
                setClientId(payload.clientId);
                setConnectedClients(payload.room.connectedClients);
            });

            const unsubscribeRoomUpdated = subscribe(
                'room-updated',
                (payload) => {
                    setConnectedClients(payload.room.connectedClients);
                }
            );

            sendMessage(socket, 'join', { roomCode: roomCode!, clientId });

            return () => {
                if (!isGameStarted && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'leave' }));
                }

                unsubscribeJoined();
                unsubscribeRoomUpdated();
            };
        };

        if (socket.readyState === WebSocket.OPEN) {
            console.log('readystate is open');
            const unsubscribeRoomUpdated = tryJoin();
            return () => unsubscribeRoomUpdated();
        } else {
            socket.addEventListener('open', tryJoin, { once: true });
            return () => socket.removeEventListener('open', tryJoin);
        }
    }, [socket]);

    useEffect(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        const handleBeforeUnload = () => {
            console.log('before unload');
            if (!isGameStarted) {
                socket.send(JSON.stringify({ type: 'leave' }));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (!isGameStarted && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'leave' }));
            }
        };
    }, [socket, isGameStarted]);

    if (connectionStatus === 'connecting') {
        return <div>Loading...</div>;
    }

    if (connectionStatus === 'closed' || connectionStatus === 'error') {
        return <div>There was an error.</div>;
    }

    return isGameStarted ? (
        <div>TODO: GAME</div>
    ) : (
        <Room clientId={clientId} connectedClients={connectedClients} />
    );
};

export default GameRoom;
