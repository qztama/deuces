"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const redis_1 = require("./services/redis");
const error_1 = require("./utils/error");
const room_1 = require("./services/room");
// HTTP Server
const app = (0, express_1.default)();
const port = 3000;
app.use(error_1.errorHandler);
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomCode = yield (0, room_1.create)();
        res.status(200).json({ roomCode });
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    // Redis Server
    yield (0, redis_1.initRedis)();
    // WebSocket Server
    const wssPort = 3001;
    const wss = new ws_1.WebSocketServer({ port: wssPort }, () => {
        console.log('Websocket Server Started');
    });
    wss.on('connection', (client) => {
        let connectionInfo;
        client.send(JSON.stringify({
            type: 'connected',
        }));
        client.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            var message = JSON.parse(String(data));
            console.log('Player Message:', message);
            try {
                switch (message.type) {
                    case 'join': {
                        connectionInfo = yield handleJoinRoom(client, message);
                    }
                }
            }
            catch (err) {
                console.error(`Error on message with type: ${message.type}`, err);
            }
        }));
        client.on('close', () => {
            try {
                if (connectionInfo) {
                    console.log(`Connection closed for player ${connectionInfo.clientId}`);
                    (0, room_1.disconnect)(connectionInfo.roomCode, connectionInfo.clientId);
                }
            }
            catch (err) {
                console.error('Error closing connection', err);
            }
        });
    });
    wss.on('listening', () => {
        console.log(`Listening on port ${wssPort}`);
    });
}))();
function handleJoinRoom(ws, joinMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const { payload } = joinMessage;
        let clientId = (0, uuid_1.v7)();
        // user rejoined; update their clientId to their previous clientId
        if (payload.clientId) {
            clientId = payload.clientId;
        }
        const roomInfo = yield (0, room_1.join)(payload.roomCode, clientId, payload.name);
        const response = {
            type: 'joined',
            payload: {
                clientId,
                room: roomInfo,
            },
        };
        ws.send(JSON.stringify(response));
        (0, room_1.subscribeToRoomInfo)(payload.roomCode, (roomInfo) => {
            const response = {
                type: 'room-updated',
                payload: {
                    room: roomInfo,
                },
            };
            ws.send(JSON.stringify(response));
        });
        return {
            clientId,
            roomCode: roomInfo.code,
        };
    });
}
function handleWSMessage(ws, connectionInfo, dataJson) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (dataJson.type) {
            case 'join': {
                const data = dataJson;
                // user rejoined; update their clientId to their previous clientId
                if (data.payload.clientId) {
                    connectionInfo.clientId = data.payload.clientId;
                }
                const roomInfo = yield (0, room_1.join)(data.payload.roomCode, connectionInfo.clientId, data.payload.name);
                const response = {
                    type: 'joined',
                    payload: {
                        clientId: connectionInfo.clientId,
                        room: roomInfo,
                    },
                };
                ws.send(JSON.stringify(response));
            }
            default: {
                console.log('Unknown message');
            }
        }
    });
}
