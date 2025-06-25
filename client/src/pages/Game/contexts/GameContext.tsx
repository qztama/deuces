import { createContext, useContext, useEffect, useState, useRef } from 'react';

import { Card } from '@shared/game';
import {
    GameEvent,
    ObfuscatedPlayer,
    PlayerGameState,
} from '../../../../../server/services/game/types';
import { useWSContext } from './WSContext';

interface GameContextType {
    players: ObfuscatedPlayer[];
    turnNumber: number;
    hand: Card[];
    inPlay: PlayerGameState['inPlay'];
    history: GameEvent[];
    hasDealtCards: boolean;
    selectedCards: Set<Card>;
    toggleSelectedCard: (card: Card) => void;
    rearrangeHand: (rearrangedHand: Card[]) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [players, setPlayers] = useState<ObfuscatedPlayer[]>([]);
    const [turnNumber, setTurnNumber] = useState<number>(0);
    const [hand, setHand] = useState<Card[]>([]);
    const [inPlay, setInPlay] = useState<PlayerGameState['inPlay']>(null);
    const [history, setHistory] = useState<GameEvent[]>([]);
    const [selectedCards, setSelectedCards] = useState<Set<Card>>(new Set());
    const [hasDealtCards, setHasDealtCards] = useState(false);

    const isCardsDealtRef = useRef<boolean>(false);

    const { clientId = '0197944f-1401-7597-ab1b-c057fa058878', subscribe } =
        useWSContext();

    useEffect(() => {
        let isMounted = true;
        const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
        const nextFrame = () =>
            new Promise((res) => requestAnimationFrame(() => res(null)));

        const dealCards = async (
            initialHand: Card[],
            initialPlayers: ObfuscatedPlayer[]
        ) => {
            isCardsDealtRef.current = false;
            let tempPlayers = initialPlayers.map((p) => ({
                ...p,
                cardsLeft: 0,
            }));

            // start with clean slate
            setHasDealtCards(false);
            setPlayers(tempPlayers);
            setHand([]);

            await nextFrame(); // ✅ wait one frame to avoid batching

            console.log(initialPlayers, tempPlayers);

            while (
                isMounted &&
                initialPlayers.some(
                    (ip, idx) => tempPlayers[idx].cardsLeft < ip.cardsLeft
                )
            ) {
                console.log('inside while');
                for (let i = 0; i < tempPlayers.length; i++) {
                    const curPlayer = tempPlayers[i];
                    console.log(curPlayer);
                    if (curPlayer.cardsLeft < initialPlayers[i].cardsLeft) {
                        // deal new card this player
                        if (curPlayer.id === clientId) {
                            const cardToDealIdx = curPlayer.cardsLeft;
                            setHand((prev) => {
                                console.log(
                                    'setting hand',
                                    curPlayer.cardsLeft,
                                    [...prev, initialHand[cardToDealIdx]]
                                );
                                return [...prev, initialHand[cardToDealIdx]];
                            });
                        }

                        // increment cardsLeft
                        tempPlayers = tempPlayers.slice();
                        tempPlayers[i].cardsLeft++;
                        setPlayers(tempPlayers);

                        await nextFrame();
                        await wait(60);
                    }
                }
            }

            await nextFrame();
            isCardsDealtRef.current = true;
        };

        if (!isCardsDealtRef.current) {
            setTimeout(() => {
                setHasDealtCards(true);
            }, 5200);
            dealCards(
                [
                    '2D',
                    '4C',
                    '8S',
                    'AS',
                    '9D',
                    '5C',
                    '2H',
                    'TS',
                    '3S',
                    'JC',
                    'KH',
                    '6C',
                    'KS',
                    '8H',
                    '4D',
                    '5H',
                    'AH',
                ],
                [
                    {
                        id: '01979450-18aa-733d-b50a-7e28c6f8e080',
                        cardsLeft: 18,
                    },
                    {
                        id: '0197944f-6f1f-7242-8a5d-b0dbc38335f6',
                        cardsLeft: 17,
                    },
                    {
                        id: '0197944f-1401-7597-ab1b-c057fa058878',
                        cardsLeft: 17,
                    },
                ]
            );
        }

        const unsubscribeGameStarted = subscribe('game-updated', (payload) => {
            // TODO: change this to 'game-started'
            const { opponents, hand, history } = payload.gameState;

            setHistory(history);
            dealCards(hand, opponents);
        });

        const unsubscribeGameUpdated = subscribe('game-updated', (payload) => {
            const { opponents, turnNumber, hand, inPlay, history } =
                payload.gameState;

            setPlayers(opponents);
            setTurnNumber(turnNumber);
            setInPlay(inPlay);
            setHistory(history);
            setHand(hand);
        });

        return () => {
            isMounted = false;
            unsubscribeGameUpdated();
            unsubscribeGameStarted();
        };
    }, []);

    return (
        <GameContext.Provider
            value={{
                players,
                turnNumber,
                hand,
                inPlay,
                history,
                hasDealtCards,
                selectedCards,
                toggleSelectedCard: (card: Card) => {
                    const newSelectedCards = new Set(selectedCards);

                    if (newSelectedCards.has(card)) {
                        newSelectedCards.delete(card);
                    } else {
                        newSelectedCards.add(card);
                    }

                    setSelectedCards(newSelectedCards);
                },
                rearrangeHand: (rearrangedHand: Card[]) => {
                    if (rearrangedHand.length !== hand.length) {
                        throw new Error('Rearange Hand: Invalid hand length');
                    }

                    const isTheSameCards =
                        rearrangedHand.every((c) => hand.includes(c)) &&
                        hand.every((c) => rearrangedHand.includes(c));

                    if (!isTheSameCards) {
                        throw new Error(
                            'Rearrange Hand: Cards mismatched previous hand.'
                        );
                    }

                    setHand(rearrangedHand);
                },
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => {
    const ctx = useContext(GameContext);
    if (!ctx)
        throw new Error('useGameContext must be used within the provider');
    return ctx;
};
