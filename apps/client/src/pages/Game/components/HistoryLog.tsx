import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';

import { useGameContext } from '../contexts/GameContext';
import { GameEvent, ObfuscatedPlayer, Rank, Suit } from '@deuces/shared/types';
import { PlayingCardIcon } from './PlayingCard/PlayingCardIcon';

const MotionBox = motion(Box);

interface HistoryLogProps {
    isOpen: boolean;
}

export const HistoryLog = ({ isOpen }: HistoryLogProps) => {
    const { history, players } = useGameContext();
    const historyLogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && historyLogRef.current) {
            historyLogRef.current.scrollTop =
                historyLogRef.current.scrollHeight;

            historyLogRef.current.scrollTo({
                top: historyLogRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && historyLogRef.current) {
            historyLogRef.current.scrollTo({
                top: historyLogRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [history]);

    return (
        <AnimatePresence>
            {isOpen && (
                <MotionBox
                    ref={historyLogRef}
                    initial={{
                        x: '-50%',
                        y: 100,
                        opacity: 0,
                    }}
                    animate={{ x: '-50%', y: 0, opacity: 1 }}
                    exit={{ x: '-50%', y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    sx={{
                        zIndex: 2000,
                        position: 'absolute',
                        bottom: '12px',
                        left: '50%',
                        width: '400px',
                        height: '200px',
                        maxHeight: '200px',
                        background: 'rgba(0,0,0,0.7)',
                        overflowY: 'auto',
                        borderRadius: '8px',
                        padding: '12px',
                        color: '#fff',

                        '&::-webkit-scrollbar': { width: '8px' },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#888',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: '#555',
                        },
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#888 transparent',
                    }}
                >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Play History
                    </Typography>
                    {history.map((gameEvent, idx) => {
                        const cardsKey = gameEvent.cards?.join(',');
                        const key = !!cardsKey
                            ? `${gameEvent.playerId}-${gameEvent.action}-${cardsKey}`
                            : `${gameEvent.playerId}-${gameEvent.action}`;

                        return (
                            <Box padding="4px 2px">
                                <HistoryLogItem
                                    key={key}
                                    gameEvent={gameEvent}
                                    players={players}
                                    turnNumber={idx}
                                />
                            </Box>
                        );
                    })}
                </MotionBox>
            )}
        </AnimatePresence>
    );
};

interface HistoryLogItemProps {
    gameEvent: GameEvent;
    players: ObfuscatedPlayer[];
    turnNumber: number;
}

const HistoryLogItem = ({
    gameEvent,
    players,
    turnNumber,
}: HistoryLogItemProps) => {
    const playerName =
        players.find((p) => p.id === gameEvent.playerId)?.name ?? 'Anon';

    if (gameEvent.action === 'passed') {
        return (
            <Box display="flex">
                <Typography fontSize="16px">
                    Turn {turnNumber}: {playerName} passed
                </Typography>
            </Box>
        );
    }

    const cards = !!gameEvent.cards ? (
        <Box display="flex" gap="8px">
            {gameEvent.cards.map((c) => (
                <PlayingCardIcon
                    key={c}
                    rank={c.charAt(0) as Rank}
                    suit={c.charAt(1) as Suit}
                    widthInPx={17}
                />
            ))}
        </Box>
    ) : null;

    return (
        <Box display="flex" gap="8px">
            <Typography fontSize="16px">
                Turn {turnNumber}: {playerName} {gameEvent.action}
            </Typography>
            {cards}
        </Box>
    );
};
