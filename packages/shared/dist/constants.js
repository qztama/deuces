"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/constants.ts
var constants_exports = {};
__export(constants_exports, {
  AVATAR_OPTIONS: () => AVATAR_OPTIONS,
  DECK_SIZE: () => DECK_SIZE,
  HAND_TYPES: () => HAND_TYPES,
  HAND_TYPE_MULTIPLER: () => HAND_TYPE_MULTIPLER,
  RANKS: () => RANKS,
  RANK_MULTIPLER: () => RANK_MULTIPLER,
  SUITS: () => SUITS,
  WS_ERR_TYPES: () => WS_ERR_TYPES
});
module.exports = __toCommonJS(constants_exports);
var DECK_SIZE = 52;
var RANKS = ["3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A", "2"];
var SUITS = ["D", "C", "H", "S"];
var HAND_TYPES = [
  "single",
  "pair",
  "triple",
  "quad",
  "straight",
  "flush",
  "fullhouse",
  "fourplusone",
  "straightflush"
];
var HAND_TYPE_MULTIPLER = 1e3;
var RANK_MULTIPLER = 10;
var WS_ERR_TYPES = {
  GENERIC: "Internal Server Error",
  JOIN_ROOM: "Join Room Error",
  INVALID_MOVE: "Invalid Move"
};
var AVATAR_OPTIONS = ["ASTRO", "ASTROBEAR", "GORILLA", "MOUSE"];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AVATAR_OPTIONS,
  DECK_SIZE,
  HAND_TYPES,
  HAND_TYPE_MULTIPLER,
  RANKS,
  RANK_MULTIPLER,
  SUITS,
  WS_ERR_TYPES
});
//# sourceMappingURL=constants.js.map