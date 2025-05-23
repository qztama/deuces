import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Box } from '@mui/material';

import {
    WSMessageBase,
    WSMessageJoin,
    WSMessageJoined,
    WSMessageRoomUpdated,
} from '../../../shared/wsMessages';

interface ConnectedClient {
    id: string;
    name: string;
    isHost: boolean;
    status: 'connected' | 'disconnected';
}

function joinRoom(ws: WebSocket, roomCode: string, clientId?: string) {
    const joinMessage: WSMessageJoin = {
        type: 'join',
        payload: {
            roomCode,
            clientId,
        },
    };

    ws.send(JSON.stringify(joinMessage));
}

function getRoomClientLSK(roomCode: string) {
    return `${roomCode}-client-id`;
}

const Room = () => {
    const ws = useRef<WebSocket>(null);
    const { roomCode } = useParams<{ roomCode: string }>();
    const [clientId, setClientId] = useState(() => {
        if (!roomCode) {
            return '';
        }
        return localStorage.getItem(getRoomClientLSK(roomCode)) ?? '';
    });
    const [connectedClients, setConnectedClients] = useState<ConnectedClient[]>(
        []
    );

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:3001');

        ws.current.onopen = () => {
            console.log('WS Opened. Joining room...');
        };
        ws.current.onclose = () => console.log('WS Closed');
        ws.current.onerror = (err) => console.log(err);

        ws.current.onmessage = function (event) {
            console.log(event);
            const message = JSON.parse(event.data) as WSMessageBase;

            switch (message.type) {
                case 'connected': {
                    console.log('CONNECTED');
                    joinRoom(ws.current!, roomCode!, clientId);
                    break;
                }
                case 'joined': {
                    console.log(message);
                    const joinedMessage = message as WSMessageJoined;

                    setClientId(joinedMessage.payload.clientId);
                    localStorage.setItem(
                        getRoomClientLSK(roomCode!),
                        joinedMessage.payload.clientId
                    );
                    setConnectedClients(
                        joinedMessage.payload.room.connectedClients
                    );
                    break;
                }
                case 'room-updated': {
                    console.log(message);
                    const roomUpdatedMessage = message as WSMessageRoomUpdated;
                    setConnectedClients(
                        roomUpdatedMessage.payload.room.connectedClients
                    );
                }
            }
        };

        return () => {
            ws.current!.close();
        };
    }, []);

    return (
        <Box width="100%" height="100%">
            <h1>Room</h1>
            <h2>Client Id {clientId}</h2>
            <h2>Connected Client</h2>
            <pre>{JSON.stringify(connectedClients)}</pre>
        </Box>
    );
};

export default Room;
