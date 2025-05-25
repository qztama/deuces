import { Room } from "../server/services/room";

export interface WSMessageBase {
  type: "connected" | "join" | "joined" | "room-updated";
  payload?: Record<string, any>;
}

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

export interface WSMessageRoomUpdated extends WSMessageBase {
  type: "room-updated";
  payload: {
    clientId: string;
    room: Room;
  };
}

export type WSMessage =
  | WSMessageConnected
  | WSMessageJoin
  | WSMessageJoined
  | WSMessageLeave
  | WSMessageRoomUpdated;

type MessageMap<T extends { type: string }> = {
  [M in T as M["type"]]: M;
};

export type WSMessageMap = MessageMap<WSMessage>;
