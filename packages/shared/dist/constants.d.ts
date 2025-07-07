import { R as Rank, S as Suit, H as HandType } from './game-OipAfyzY.js';

declare const DECK_SIZE = 52;
declare const RANKS: Rank[];
declare const SUITS: Suit[];
declare const HAND_TYPES: HandType[];
declare const HAND_TYPE_MULTIPLER = 1000;
declare const RANK_MULTIPLER = 10;
declare const WS_ERR_TYPES: {
    readonly GENERIC: "Internal Server Error";
    readonly INVALID_MOVE: "Invalid Move";
};

export { DECK_SIZE, HAND_TYPES, HAND_TYPE_MULTIPLER, RANKS, RANK_MULTIPLER, SUITS, WS_ERR_TYPES };
