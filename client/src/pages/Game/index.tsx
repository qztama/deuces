import { useState, useEffect } from 'react';
import { useParams } from 'react-router';

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
    const [isGameStarted, setIsGameStarted] = useState(true);

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
    const [gameState, setGameState] = useState<
        WSMessageGameUpdated['payload']['gameState']
    >(() => {
        return {
            id: '0197944f-1401-7597-ab1b-c057fa058878',
            hand: [
                '2D',
                '4C',
                '8S',
                'AS',
                '9D',
                '5C',
                '2H',
                'TS',
                '3S',
                'JC',
                'KH',
                '6C',
                'KS',
                '8H',
                '4D',
                '5H',
                'AH',
            ],
            opponents: [
                {
                    id: '01979450-18aa-733d-b50a-7e28c6f8e080',
                    cardsLeft: 18,
                },
                {
                    id: '0197944f-6f1f-7242-8a5d-b0dbc38335f6',
                    cardsLeft: 17,
                },
            ],
            inPlay: null,
            turnNumber: 0,
            history: [
                {
                    playerId: '01979450-18aa-733d-b50a-7e28c6f8e080',
                    action: 'received',
                    cards: ['6S'],
                },
            ],
        };
    });

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
