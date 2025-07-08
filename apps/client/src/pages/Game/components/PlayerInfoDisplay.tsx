import { Box, Badge, Typography, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';

import { Card, Rank, Suit } from '@deuces/shared';

import TrophyIcon from '../../../assets/icons/trophy.svg?react';
import { GameAvatar } from '../../../components/GameAvatar';
import { PlayingCardIcon } from './PlayingCard/PlayingCardIcon';
import { useGameContext } from '../contexts/GameContext';
import { PlayingCardBack } from './PlayingCard/PlayingCardBack';

interface PlayerInfoDisplayProps {
    id: string;
    name?: string;
    cardsLeft: number;
    hasPassed: boolean;
    isTurn: boolean;
    middleCard?: Card;
}

export const PlayerInfoDisplay = ({
    id,
    name,
    cardsLeft,
    hasPassed,
    isTurn,
    middleCard,
}: PlayerInfoDisplayProps) => {
    const { palette } = useTheme();
    const { winners } = useGameContext();

    const borderColor = isTurn ? palette.primary.main : palette.secondary.main;

    const trophyColor = (() => {
        const placing = winners.findIndex((p) => p.id === id);
        const rankColors = [
            palette.rank.gold,
            palette.rank.silver,
            palette.rank.bronze,
        ];

        // only support up to 4 players (3 colors)
        if (placing < rankColors.length) {
            return rankColors[placing];
        }

        return null;
    })();

    return (
        <Box
            display="flex"
            flexDirection="column"
            borderRadius="24px"
            border={`1px solid ${borderColor}`}
            padding="16px"
            position="relative"
            width="250px"
        >
            <Box display="flex" gap="16px">
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    paddingBottom="8px"
                >
                    <Badge
                        color="success"
                        overlap="circular"
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        variant="dot"
                        slotProps={{
                            badge: {
                                sx: {
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                },
                            },
                        }}
                    >
                        <GameAvatar name="ASTRO" sizeInPx={64} />
                    </Badge>
                </Box>
                <Box>
                    <Typography fontSize="24px">{name}</Typography>
                    <Box sx={{ userSelect: 'none' }}>
                        {isTurn ? (
                            <TurnIndicator />
                        ) : (
                            <Typography fontSize="20px">
                                {hasPassed ? 'Pass!' : 'Ready!'}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
            {/* middle card display */}
            {middleCard && (
                <Box
                    position="absolute"
                    sx={{
                        left: '-8px',
                        bottom: '-12px',
                        transform: 'rotate(-10deg)',
                    }}
                >
                    <PlayingCardIcon
                        widthInPx={25}
                        rank={middleCard.charAt(0) as Rank}
                        suit={middleCard.charAt(1) as Suit}
                    />
                </Box>
            )}

            {/* hand display */}
            <Box
                position="absolute"
                sx={{
                    left: '50%',
                    bottom: '16px',
                }}
            >
                <PlayerDisplayHand cardWidthInPx={18} cardsLeft={cardsLeft} />
            </Box>
            {/* trophy display */}
            {trophyColor && (
                <Box
                    position="absolute"
                    sx={{ bottom: '-20px', right: '-12px' }}
                >
                    <TrophyIcon width="40px" />
                </Box>
            )}
        </Box>
    );
};

const TurnIndicator = () => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="32px"
            lineHeight="20px"
            sx={{ transform: 'translateY(-4px)', userSelect: 'none' }}
        >
            {[0, 1, 2].map((dot) => (
                <motion.span
                    key={dot}
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                        repeat: Infinity, // infinite loop
                        duration: 1,
                        repeatDelay: 0.2,
                        delay: dot * 0.3,
                    }}
                    style={{ marginLeft: 4, borderRadius: '50%' }}
                >
                    .
                </motion.span>
            ))}
        </Box>
    );
};

const PlayerDisplayHand = ({
    cardWidthInPx,
    cardsLeft,
}: {
    cardWidthInPx: number;
    cardsLeft: number;
}) => {
    const overlapInPx = cardWidthInPx / 2;
    const totalWidth = cardWidthInPx + (cardsLeft - 1) * overlapInPx;
    const centerOffset = totalWidth / 2;

    const maxFanAngle = 30; // total degrees of the fan, tweak as you like
    const angleStep = cardsLeft > 1 ? maxFanAngle / (cardsLeft - 1) : 0;

    // Tweak this for how pronounced the arc is
    const arcRadius = 120; // bigger = flatter arc

    return (
        <Box position="relative" width={totalWidth} display="flex">
            <AnimatePresence>
                {Array.from({ length: cardsLeft }).map((_, idx) => {
                    const x = idx * overlapInPx - centerOffset;

                    // Calculate rotation so that cards fan around center
                    const rotate = -maxFanAngle / 2 + idx * angleStep;

                    // Convert rotation to radians for Y offset
                    const radians = (rotate * Math.PI) / 180;
                    const y = -Math.cos(radians) * arcRadius + arcRadius;

                    return (
                        <motion.div
                            key={idx}
                            initial={{
                                opacity: 0,
                                y: y + 60,
                                scale: 0.8,
                            }}
                            animate={{
                                opacity: 1,
                                y,
                                scale: 1,
                                x,
                                rotate,
                                transition: {
                                    duration: 0.4,
                                },
                            }}
                            exit={{
                                opacity: 0,
                                y: y - 60,
                                transition: { duration: 0.4 },
                            }}
                            style={{
                                position: 'absolute',
                                transformOrigin: 'bottom center',
                                zIndex: 1000,
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            }}
                        >
                            <PlayingCardBack widthInPx={cardWidthInPx} />
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            <Box
                position="absolute"
                sx={{ zIndex: 1001, transform: 'translate(-50%, 15%)' }}
            >
                <Typography fontSize="16px">{cardsLeft}</Typography>
            </Box>
        </Box>
    );
};
