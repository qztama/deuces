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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AVATAR_OPTIONS: () => AVATAR_OPTIONS,
  DECK_SIZE: () => DECK_SIZE,
  HAND_TYPES: () => HAND_TYPES,
  HAND_TYPE_MULTIPLER: () => HAND_TYPE_MULTIPLER,
  RANKS: () => RANKS,
  RANK_MULTIPLER: () => RANK_MULTIPLER,
  SUITS: () => SUITS,
  WS_ERR_TYPES: () => WS_ERR_TYPES,
  checkForStraight: () => checkForStraight,
  getCardScore: () => getCardScore,
  getHandRep: () => getHandRep,
  getHandType: () => getHandType
});
module.exports = __toCommonJS(index_exports);

// src/constants.ts
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
  INVALID_MOVE: "Invalid Move"
};
var AVATAR_OPTIONS = ["ASTRO", "ASTROBEAR", "GORILLA", "MOUSE"];

// src/utils/handUtils.ts
function checkForStraight(move) {
  if (move.length !== 5) {
    return { isStraight: false, rep: null };
  }
  const freqLine = Array.from({ length: 14 }, () => []);
  for (let c of move) {
    const rank = c.charAt(0);
    let updateIdx;
    if (rank === "A") updateIdx = [0, 13];
    else if (rank === "T") updateIdx = [9];
    else if (rank === "J") updateIdx = [10];
    else if (rank === "Q") updateIdx = [11];
    else if (rank === "K") updateIdx = [12];
    else {
      updateIdx = [Number(rank) - 1];
    }
    for (let idx of updateIdx) {
      freqLine[idx].push(c);
    }
  }
  for (let i = 0; i <= 9; i++) {
    if (freqLine[i].length > 0) {
      let consecutiveCount = 0;
      for (let j = i; j < i + 5 && freqLine[j].length > 0; j++) {
        consecutiveCount++;
      }
      if (consecutiveCount === 5) {
        return { isStraight: true, rep: freqLine[i + 4][0] };
      }
    }
  }
  return { isStraight: false, rep: null };
}
function getHandType(move) {
  const rankCounts = /* @__PURE__ */ new Map();
  const suitCounts = /* @__PURE__ */ new Map();
  for (let c of move) {
    const rank = c.charAt(0);
    const suit = c.charAt(1);
    const curRankCount = rankCounts.get(rank) ?? 0;
    rankCounts.set(rank, curRankCount + 1);
    const curSuitCount = suitCounts.get(suit) ?? 0;
    suitCounts.set(suit, curSuitCount + 1);
  }
  const sortedRankCounts = Array.from(rankCounts.values()).sort((a, b) => b - a);
  const sortedSuitCounts = Array.from(suitCounts.values()).sort((a, b) => b - a);
  if (move.length === 1) return "single";
  if (move.length === 2 && sortedRankCounts[0] === 2) return "pair";
  if (move.length === 3 && sortedRankCounts[0] === 3) return "triple";
  if (move.length === 4 && sortedRankCounts[0] === 4) return "quad";
  if (move.length === 5) {
    const { isStraight, rep: straightRepCard } = checkForStraight(move);
    const isFlush = sortedSuitCounts[0] === 5;
    if (isStraight && isFlush) return "straightflush";
    else if (sortedRankCounts[0] === 4) return "fourplusone";
    else if (sortedRankCounts[0] === 3 && sortedRankCounts[1] === 2) return "fullhouse";
    else if (isFlush) return "flush";
    else if (isStraight) return "straight";
  }
  return null;
}
function getCardScore(card) {
  const rank = card.charAt(0);
  const suit = card.charAt(1);
  return RANKS.findIndex((r) => r === rank) * RANK_MULTIPLER + SUITS.findIndex((s) => s === suit);
}
function getHighestRankAmongCards(cards) {
  const sortedCards = cards.slice().sort((cardA, cardB) => getCardScore(cardB) - getCardScore(cardA));
  return sortedCards[0];
}
function getHandRep(handType, move) {
  if (["pair", "triple", "quad", "single", "flush"].includes(handType)) {
    return getHighestRankAmongCards(move);
  }
  if (["fullhouse", "fourplusone"].includes(handType)) {
    const groupedByRank = /* @__PURE__ */ new Map();
    for (let c of move) {
      const cardRank = c.charAt(0);
      if (groupedByRank.has(cardRank)) {
        groupedByRank.get(cardRank).push(c);
      } else {
        groupedByRank.set(cardRank, [c]);
      }
    }
    let largestCardGroup = [];
    for (let [_, cardGroup] of groupedByRank) {
      if (largestCardGroup.length < cardGroup.length) {
        largestCardGroup = cardGroup;
      }
    }
    return getHighestRankAmongCards(largestCardGroup);
  }
  const { rep } = checkForStraight(move);
  return rep;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AVATAR_OPTIONS,
  DECK_SIZE,
  HAND_TYPES,
  HAND_TYPE_MULTIPLER,
  RANKS,
  RANK_MULTIPLER,
  SUITS,
  WS_ERR_TYPES,
  checkForStraight,
  getCardScore,
  getHandRep,
  getHandType
});
//# sourceMappingURL=index.js.map