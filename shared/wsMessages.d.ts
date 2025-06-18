import { Room } from "../server/services/room";
import { PlayerGameState } from "../server/services/game/types";

export interface WSMessageBase {
  type: "connected" | "join" | "joined" | "room-updated";
  payload?: Record<string, any>;
}

// Server Side
export interface WSMessageConnected extends WSMessageBase {
  type: "connected";
}

export interface WSMessageJoin extends WSMessageBase {
  type: "join";
  payload: {
    roomCode: string;
    clientId?: string;
    name?: string;
  };
}

export interface WSMessageJoined extends WSMessageBase {
  type: "joined";
  payload: {
    clientId: string;
    room: Room;
  };
}

export interface WSMessageLeave {
  type: "leave";
}

export interface WSMessageStartGame {
  type: "start-game";
}

// Client Side
export interface WSMessageRoomUpdated extends WSMessageBase {
  type: "room-updated";
  payload: {
    clientId: string;
    room: Room;
  };
}

export interface WSMessageGameUpdated extends WSMessageBase {
  type: "game-updated";
  payload: {
    gameState: PlayerGameState;
  };
}

export type WSMessage =
  | WSMessageConnected
  | WSMessageJoin
  | WSMessageJoined
  | WSMessageLeave
  | WSMessageStartGame
  | WSMessageRoomUpdated
  | WSMessageGameUpdated;

type MessageMap<T extends { type: string }> = {
  [M in T as M["type"]]: M;
};

export type WSMessageMap = MessageMap<WSMessage>;
