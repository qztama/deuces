import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useTheme } from '@mui/material';
import { CancelOutlined, ThunderstormOutlined } from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';

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
    const { subscribe } = useWSContext();
    const { clientId, connectedClients, isGameStarted } = useRoomContext();
    const { palette } = useTheme();

    useEffect(() => {
        // TODO: revisit toast styling
        const unsubscribeToWSError = subscribe('error', ({ type, message }) => {
            let errorIcon;
            let errorColor;

            if (type === 'Internal Server Error') {
                errorIcon = <ThunderstormOutlined fontSize="small" />;
                errorColor = palette.error.main;
            } else {
                // Invalid Move
                errorIcon = (
                    <CancelOutlined fontSize="small" color={errorColor} />
                );
                errorColor = palette.primary.main;
            }
            toast(message, {
                duration: 4000,
                icon: errorIcon,
                style: {
                    background: palette.background.default,
                    border: `1px solid ${errorColor}`,
                    color: errorColor,
                },
            });
        });

        return unsubscribeToWSError;
    }, []);

    if (connectionStatus === 'connecting') {
        return <div>Loading...</div>;
    }

    if (connectionStatus === 'closed' || connectionStatus === 'error') {
        return <div>There was an error.</div>;
    }

    return (
        <>
            <Toaster position="top-right" />
            {isGameStarted ? (
                <GameContextProvider>
                    <GameView />
                </GameContextProvider>
            ) : (
                <Room
                    clientId={clientId}
                    roomCode={roomCode!}
                    connectedClients={connectedClients}
                />
            )}
        </>
    );
};

export default GameRoom;
