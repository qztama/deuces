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
const redis_1 = require("./services/redis");
const error_1 = require("./utils/error");
const room_1 = require("./services/room");
const ws_1 = require("./ws");
const WSS_PORT = 3001;
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
function startServers() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, redis_1.initRedisClient)();
        (0, ws_1.initWebsocketServer)(WSS_PORT);
    });
}
startServers();
//# sourceMappingURL=index.js.map