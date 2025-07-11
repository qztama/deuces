import { WebSocket } from 'ws';

export interface WSContext {
    ws: WebSocket;
    clientId: string;
    roomCode?: string;
    isGameStarted: boolean;
    isGameOver: boolean;
}
