import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    useMemo,
    useCallback,
} from 'react';

import {
    Card,
    GameEvent,
    ObfuscatedPlayer,
    PlayerGameState,
} from '@deuces/shared';
import { useWSContext } from './WSContext';
import { useRoomContext } from './RoomContext';

const TIME_BETWEEN_CARD_DEAL_IN_MS = 50;

interface GameContextType {
    players: ObfuscatedPlayer[];
    curTurnPlayer: ObfuscatedPlayer | null;
    inPlay: PlayerGameState['inPlay'];
    history: GameEvent[];
    winners: ObfuscatedPlayer[];
    isGameOver: boolean;
    makeMove: (move: 'play' | 'pass', cards: Card[]) => void;
}

interface HandContextType {
    hand: Card[];
    hasDealtCards: boolean;
    selectedCards: Set<Card>;
    toggleSelectedCard: (card: Card) => void;
    rearrangeHand: (rearrangedHand: Card[]) => void;
}

const GameContext = createContext<GameContextType | null>(null);
const HandContext = createContext<HandContextType | null>(null);

export const GameContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [players, setPlayers] = useState<ObfuscatedPlayer[]>([]);
    const [turnNumber, setTurnNumber] = useState<number>(-1);
    const [hand, setHand] = useState<Card[]>([]);
    const [inPlay, setInPlay] = useState<PlayerGameState['inPlay']>(null);
    const [history, setHistory] = useState<GameEvent[]>([]);
    const [winners, setWinners] = useState<ObfuscatedPlayer[]>([]);

    const [selectedCards, setSelectedCards] = useState<Set<Card>>(new Set());
    const [hasDealtCards, setHasDealtCards] = useState(false);

    const lastProcessingTurnNumber = useRef<number>(-1);
    const isCardsDealtRef = useRef<boolean>(false);

    const { subscribe, sendMessage } = useWSContext();
    const { clientId, isGameStarted } = useRoomContext();

    const isGameOver = winners.length === players.length - 1;
    const curTurnPlayer = players.length
        ? players[turnNumber % players.length]
        : null;

    useEffect(() => {
        if (!isGameStarted) {
            return;
        }

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

            while (
                isMounted &&
                initialPlayers.some(
                    (ip, idx) => tempPlayers[idx].cardsLeft < ip.cardsLeft
                )
            ) {
                for (let i = 0; i < tempPlayers.length; i++) {
                    const curPlayer = tempPlayers[i];
                    if (curPlayer.cardsLeft < initialPlayers[i].cardsLeft) {
                        // deal new card this player
                        if (curPlayer.id === clientId) {
                            const cardToDealIdx = curPlayer.cardsLeft;
                            setHand((prev) => {
                                return [...prev, initialHand[cardToDealIdx]];
                            });
                        }

                        // increment cardsLeft
                        tempPlayers = tempPlayers.slice();
                        tempPlayers[i].cardsLeft++;
                        setPlayers(tempPlayers);

                        await nextFrame();
                        await wait(TIME_BETWEEN_CARD_DEAL_IN_MS);
                    }
                }
            }

            await nextFrame();
            isCardsDealtRef.current = true;
        };

        const unsubscribeGameUpdated = subscribe('game-updated', (payload) => {
            const {
                players: newPlayers,
                turnNumber: newTurnNumber,
                hand: newHand,
                inPlay: newInPlay,
                history: newHistory,
                winners: newWinners,
            } = payload.gameState;

            if (lastProcessingTurnNumber.current === newTurnNumber) {
                // already processed the current turn already
                return;
            }
            lastProcessingTurnNumber.current = newTurnNumber;

            const isFirstTurn = newTurnNumber === 0;

            if (!isCardsDealtRef.current && isFirstTurn) {
                setTimeout(() => {
                    setHasDealtCards(true);
                }, TIME_BETWEEN_CARD_DEAL_IN_MS * 3 * 52);

                setHistory(newHistory);
                setTurnNumber(newTurnNumber);
                dealCards(newHand, newPlayers);
            } else {
                setPlayers(newPlayers);
                setTurnNumber(newTurnNumber);
                setInPlay(newInPlay);
                setHistory(newHistory);
                setWinners(
                    newWinners
                        .map((id) => newPlayers.find((p) => p.id === id))
                        .filter((p): p is ObfuscatedPlayer => Boolean(p?.id))
                );
                setHand((prev) => {
                    if (!prev.length) {
                        // hand not loaded yet so just update
                        return newHand;
                    }
                    // otherwise preserve client side sort order
                    return prev.filter((c) => newHand.includes(c));
                });
            }
        });

        sendMessage('connect-to-game');

        return () => {
            isMounted = false;
            unsubscribeGameUpdated();
        };
    }, [isGameStarted]);

    const makeMove = useCallback(
        (move: 'play' | 'pass', cards: Card[]) => {
            if (move === 'pass') {
                sendMessage('play-move', { move: [] });
                return;
            }

            sendMessage('play-move', { move: Array.from(cards) });
            // clear the selected cards
            setSelectedCards(new Set());
        },
        [sendMessage, setSelectedCards]
    );

    const gameContextValue = useMemo(
        () => ({
            players,
            curTurnPlayer,
            inPlay,
            history,
            winners,
            isGameOver,
            makeMove,
        }),
        [players, curTurnPlayer, inPlay, history, winners, isGameOver, makeMove]
    );

    const handContextValue = useMemo(
        () => ({
            hand,
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
                    throw new Error('Rearrange Hand: Invalid hand length');
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
        }),
        [hand, hasDealtCards, selectedCards, setSelectedCards, setHand]
    );

    return (
        <GameContext.Provider value={gameContextValue}>
            <HandContext.Provider value={handContextValue}>
                {children}
            </HandContext.Provider>
        </GameContext.Provider>
    );
};

export const useGameContext = () => {
    const ctx = useContext(GameContext);
    if (!ctx) {
        throw new Error('useGameContext must be used within the provider');
    }
    return ctx;
};

export const useHandContext = () => {
    const ctx = useContext(HandContext);
    if (!ctx) {
        throw new Error('useHandContext must be used within the provider');
    }
    return ctx;
};
