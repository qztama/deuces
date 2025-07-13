import { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

import { Rank, Suit, DECK_SIZE } from '@deuces/shared';

import { useRoomContext } from '../../contexts/RoomContext';
import {
    GameContextProvider,
    useGameContext,
} from '../../contexts/GameContext';

import { PlayerInfoDisplay } from './components/PlayerInfoDisplay';
import { PlayingCard } from '../../components/PlayingCard/PlayingCard';
import { PlaceholderCard } from '../../components/PlayingCard/PlaceholderCard';
import { WIDTH_TO_HEIGHT_RATIO } from '../../components/PlayingCard/constants';
import { Hand } from './components/Hand';
import { PlayButton } from './components/PlayButton';
import { PassButton } from './components/PassButton';
import { SortButton } from './components/SortButton';
import { GameOverDialog } from './components/GameOverDialog';
import { HistoryLog } from './components/HistoryLog';
import { SelectedCardsDisplay } from './components/SelectedCardsDisplay';

import { PLAYING_CARD_WIDTH } from './constants';

const OPPONENT_INFO_POS: Record<
    number,
    { left?: string; right?: string; top?: string; bottom?: string }[]
> = {
    2: [
        { left: '1%', top: '35%' },
        { right: '1%', top: '35%' },
    ],
};

const GameViewContent = () => {
    const { palette } = useTheme();
    const { clientId } = useRoomContext();
    const { players, curTurnPlayer, inPlay } = useGameContext();
    const [isHistoryLogOpen, setIsHistoryLogOpen] = useState(false);

    // inPlay hand width + discard width + gaps
    const IN_PLAY_HAND_WIDTH_IN_PX = 5 * PLAYING_CARD_WIDTH + 8 * 4;
    const BOARD_WIDTH =
        5 * PLAYING_CARD_WIDTH + 8 * 4 + PLAYING_CARD_WIDTH + 32;

    const ownPlayerIdx = players.findIndex((p) => p.id === clientId);
    const ownPlayer = ownPlayerIdx !== -1 ? players[ownPlayerIdx] : undefined;
    const opponentPlayers = OPPONENT_INFO_POS[players.length - 1]?.map(
        (posObj, idx) => {
            if (ownPlayerIdx === -1) {
                return null;
            }

            const curOpponent =
                players[(ownPlayerIdx + idx + 1) % players.length];

            return (
                <Box
                    key={curOpponent.id}
                    position="absolute"
                    sx={{ ...posObj }}
                >
                    <PlayerInfoDisplay
                        id={curOpponent.id}
                        name={curOpponent.name}
                        avatar={curOpponent.avatar}
                        cardsLeft={curOpponent.cardsLeft}
                        hasPassed={curOpponent.hasPassed}
                        isTurn={curTurnPlayer?.id === curOpponent.id}
                        middleCard={curOpponent.middleCard?.[0]}
                    />
                </Box>
            );
        }
    );
    const cardsInDiscard =
        DECK_SIZE - players.reduce((acc, p) => acc + p.cardsLeft, 0);

    return (
        <Box position="relative" height="100%" overflow="hidden">
            <HistoryLog isOpen={isHistoryLogOpen} />
            <GameOverDialog />
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
                    {curTurnPlayer?.name}'s Turn
                </Typography>
            </Box>

            {/* opponents */}
            {opponentPlayers}

            {/* board center */}
            <Box
                display="flex"
                position="absolute"
                justifyContent="space-between"
                alignItems="center"
                width={`${BOARD_WIDTH}px`}
                gap="32px"
                sx={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-${BOARD_WIDTH / 2}px, -${
                        PLAYING_CARD_WIDTH / WIDTH_TO_HEIGHT_RATIO / 2
                    }px)`,
                }}
            >
                <PlaceholderCard
                    widthInPx={PLAYING_CARD_WIDTH}
                    label={`Discard (${cardsInDiscard})`}
                    onClick={() => {
                        setIsHistoryLogOpen(!isHistoryLogOpen);
                    }}
                />
                <Box
                    display="flex"
                    gap="8px"
                    width={`${IN_PLAY_HAND_WIDTH_IN_PX}px`}
                    justifyContent="center"
                >
                    {!inPlay ? (
                        <PlaceholderCard
                            widthInPx={PLAYING_CARD_WIDTH}
                            label="Play Anything"
                        />
                    ) : (
                        inPlay.hand.map((c) => (
                            <PlayingCard
                                key={c}
                                width={PLAYING_CARD_WIDTH}
                                rank={c.charAt(0) as Rank}
                                suit={c.charAt(1) as Suit}
                            />
                        ))
                    )}
                </Box>
            </Box>

            {/* player hud */}
            <Box
                display="flex"
                position="fixed"
                justifyContent="center"
                sx={{
                    width: '100%',
                    bottom: `${PLAYING_CARD_WIDTH + 40}px`,
                }}
            >
                <SelectedCardsDisplay />
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
                            name={ownPlayer.name}
                            avatar={ownPlayer.avatar}
                            cardsLeft={ownPlayer.cardsLeft}
                            hasPassed={false}
                            isTurn={curTurnPlayer?.id === ownPlayer.id}
                            middleCard={ownPlayer.middleCard?.[0]}
                        />
                    </Box>
                    <Hand />
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="4px"
                        marginRight="64px"
                    >
                        <PlayButton />
                        <PassButton />
                        <SortButton />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export const GameView = () => {
    return (
        <GameContextProvider>
            <GameViewContent />
        </GameContextProvider>
    );
};
