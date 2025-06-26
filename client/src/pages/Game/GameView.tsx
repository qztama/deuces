import { useState } from 'react';
import { Box, Button, TextField, Typography, useTheme } from '@mui/material';

import { WSMessageGameUpdated, WSMessagePlayMove } from '@shared/wsMessages';
import { Card } from '@shared/game';
import { Rank, Suit } from '@shared/game';
import { PlayingCard } from './components/PlayingCard/PlayingCard';
import { Hand } from './components/Hand';
import { useGameContext } from './contexts/GameContext';
import { PLAYING_CARD_WIDTH } from './constants';
import { PlayerInfoDisplay } from './components/PlayerInfoDisplay';
import { useWSContext } from './contexts/WSContext';
import { WIDTH_TO_HEIGHT_RATIO } from './components/PlayingCard/constants';
import { PlaceholderCard } from './components/PlayingCard/PlaceholderCard';

interface GameViewProps {
    gameState: WSMessageGameUpdated['payload']['gameState'];
    handleMove: (move: WSMessagePlayMove['payload']['move']) => void;
}

export const GameView = ({ gameState, handleMove }: GameViewProps) => {
    const { palette } = useTheme();
    const { clientId } = useWSContext();
    const { players, turnNumber } = useGameContext();
    const inPlay: Card[] = ['AD', 'AC', 'AH', 'AS'];

    const ownPlayer = players.find((p) => p.id === clientId);

    // inPlay hand width + discard width + gaps
    const IN_PLAY_WIDTH =
        5 * PLAYING_CARD_WIDTH + 8 * 4 + PLAYING_CARD_WIDTH + 32;

    return (
        <Box position="relative" height="100%">
            {/* turn indicator */}
            <Box
                position="absolute"
                padding="16px"
                sx={{
                    borderRadius: '4px',
                    border: `2px solid ${palette.secondary.dark}`,
                    left: '50%',
                    top: '2%',
                    transform: 'translateX(-50%)',
                }}
            >
                <Typography fontSize={32}>
                    Player {turnNumber % players.length}'s Turn
                </Typography>
            </Box>

            {/* opponents */}
            {players.length > 0 && (
                <>
                    <Box
                        position="absolute"
                        sx={{
                            left: '1%',
                            top: '35%',
                        }}
                    >
                        <PlayerInfoDisplay
                            id={players[0].id}
                            name="John Ham"
                            cardsLeft={players[0].cardsLeft}
                            hasPassed={false}
                        />
                    </Box>
                    <Box
                        position="absolute"
                        sx={{
                            right: '1%',
                            top: '35%',
                        }}
                    >
                        <PlayerInfoDisplay
                            id={players[1].id}
                            name="John Ham"
                            cardsLeft={players[1].cardsLeft}
                            hasPassed={false}
                        />
                    </Box>
                </>
            )}

            {/* board center */}
            <Box
                display="flex"
                position="absolute"
                justifyContent="space-between"
                alignItems="center"
                width={`${IN_PLAY_WIDTH}px`}
                gap="32px"
                sx={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-${IN_PLAY_WIDTH / 2}px, -${
                        PLAYING_CARD_WIDTH / WIDTH_TO_HEIGHT_RATIO / 2
                    }px)`,
                }}
            >
                <PlaceholderCard
                    widthInPx={PLAYING_CARD_WIDTH}
                    label="Discard"
                />
                <Box display="flex" gap="8px">
                    {inPlay.map((c) => (
                        <PlayingCard
                            key={c}
                            width={PLAYING_CARD_WIDTH}
                            rank={c.charAt(0) as Rank}
                            suit={c.charAt(1) as Suit}
                        />
                    ))}
                </Box>
            </Box>
            {ownPlayer && (
                <Box
                    display="flex"
                    justifyContent="space-between"
                    position="fixed"
                    paddingX="32px"
                    sx={{
                        bottom: `-${PLAYING_CARD_WIDTH / 2}px`,
                        width: '100%',
                    }}
                >
                    <Box>
                        <PlayerInfoDisplay
                            id={ownPlayer.id}
                            cardsLeft={ownPlayer.cardsLeft}
                            hasPassed={false}
                        />
                    </Box>
                    <Hand />
                    <Box>
                        <Button>Play</Button>
                        <Button>Pass</Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
