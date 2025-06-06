import {
    WSMessage,
    WSMessageBase,
    WSMessageJoin,
} from '../../../shared/wsMessages';
import { WSContext } from '../types';

import { handleJoinRoom, handleLeaveRoom } from './roomHandlers';

export async function handleMessage(ctx: WSContext, data: string) {
    var message = JSON.parse(String(data)) as WSMessage;

    console.log('Player Message:', message);
    try {
        switch (message.type) {
            case 'join': {
                const joinMessage = message as WSMessageJoin;
                ctx.roomCode = joinMessage.payload.roomCode;
                await handleJoinRoom(ctx, joinMessage);
                break;
            }
            case 'leave': {
                handleLeaveRoom(ctx);
            }
        }
    } catch (err) {
        console.error(`Error on message with type: ${message.type}`, err);
    }
}
