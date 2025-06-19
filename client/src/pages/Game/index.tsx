import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { TextField } from '@mui/material';

import { WSContextProvider, useWSContext } from './contexts/WSContext';
import Room from './Room';
import { WSMessageGameUpdated } from '../../../../shared/wsMessages';
import { GameView } from './GameView';

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
        <WSContextProvider>
            <GameRoomContent />
        </WSContextProvider>
    );
};

const GameRoomContent = () => {
    const { socket, connectionStatus, subscribe, sendMessage } = useWSContext();
    const { roomCode } = useParams<{ roomCode: string }>();
    const [isGameStarted, setIsGameStarted] = useState(false);

    // Room Info
    const [clientId, setClientId] = useState(() => {
        if (!roomCode) {
            return '';
        }
        return localStorage.getItem(getRoomClientLSK(roomCode)) ?? '';
    });
    const [connectedClients, setConnectedClients] = useState<ConnectedClient[]>(
        []
    );

    // Game Info
    const [gameState, setGameState] =
        useState<WSMessageGameUpdated['payload']['gameState']>();

    useEffect(() => {
        if (!socket) return;

        const tryJoin = () => {
            const unsubscribeRoomUpdated = subscribe(
                'room-updated',
                (payload) => {
                    setClientId(payload.clientId);
                    setConnectedClients(payload.room.connectedClients);
                }
            );

            const unsubscribeGameUpdated = subscribe(
                'game-updated',
                (payload) => {
                    if (payload.gameState.turnNumber === 0) {
                        setIsGameStarted(true);
                    }

                    setGameState(payload.gameState);
                }
            );

            sendMessage('join', { roomCode: roomCode!, clientId });

            return () => {
                if (!isGameStarted && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'leave' }));
                }

                unsubscribeGameUpdated();
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

    if (connectionStatus === 'connecting') {
        return <div>Loading...</div>;
    }

    if (connectionStatus === 'closed' || connectionStatus === 'error') {
        return <div>There was an error.</div>;
    }

    return isGameStarted && gameState ? (
        <GameView
            gameState={gameState}
            handleMove={(move) => {
                sendMessage('play-move', { move });
            }}
        />
    ) : (
        <Room
            clientId={clientId}
            roomCode={roomCode!}
            connectedClients={connectedClients}
        />
    );
};

export default GameRoom;
