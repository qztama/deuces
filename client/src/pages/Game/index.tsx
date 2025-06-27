import { useState, useEffect } from 'react';
import { useParams } from 'react-router';

import { WSContextProvider, useWSContext } from './contexts/WSContext';
import Room from './Room';
import { GameView } from './GameView';
import { GameContextProvider } from './contexts/GameContext';
import { RoomContextProvider, useRoomContext } from './contexts/RoomContext';

export interface ConnectedClient {
    id: string;
    name: string;
    isHost: boolean;
    status: 'connected' | 'disconnected';
}

const GameRoom = () => {
    return (
        <WSContextProvider>
            <RoomContextProvider>
                <GameRoomContent />
            </RoomContextProvider>
        </WSContextProvider>
    );
};

const GameRoomContent = () => {
    const { connectionStatus } = useWSContext();
    const { roomCode } = useParams<{ roomCode: string }>();
    const { clientId, connectedClients, isGameStarted } = useRoomContext();

    if (connectionStatus === 'connecting') {
        return <div>Loading...</div>;
    }

    if (connectionStatus === 'closed' || connectionStatus === 'error') {
        return <div>There was an error.</div>;
    }

    return isGameStarted ? (
        <GameContextProvider>
            <GameView />
        </GameContextProvider>
    ) : (
        <Room
            clientId={clientId}
            roomCode={roomCode!}
            connectedClients={connectedClients}
        />
    );
};

export default GameRoom;
