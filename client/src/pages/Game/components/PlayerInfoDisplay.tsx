import { Box, Avatar, Typography, Tooltip, useTheme } from '@mui/material';
import TrophyIcon from '../../../assets/icons/trophy.svg?react';

import BlockIcon from '@mui/icons-material/Block';
import { PlayingCardIcon } from './PlayingCard/PlayingCardIcon';
import { useGameContext } from '../contexts/GameContext';

interface PlayerInfoDisplayProps {
    id: string;
    name?: string;
    cardsLeft: number;
    hasPassed: boolean;
    isTurn: boolean;
}

export const PlayerInfoDisplay = ({
    id,
    name,
    cardsLeft,
    hasPassed,
    isTurn,
}: PlayerInfoDisplayProps) => {
    const { palette } = useTheme();
    const { winners } = useGameContext();

    const passedIconColor = hasPassed ? 'red' : 'grey';
    const borderColor = isTurn ? palette.primary.main : palette.secondary.main;
    const initials = name?.split(' ').reduce((acc, cur) => {
        acc += cur.charAt(0).toUpperCase();
        return acc;
    }, '');

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
            borderRadius="2px"
            width="200px"
            border={`1px solid ${borderColor}`}
            padding="8px"
            flexDirection="column"
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                paddingBottom="8px"
            >
                <Avatar>{initials}</Avatar>
                <Typography>{name}</Typography>
            </Box>
            <Box>
                <Typography fontSize="16px">Cards Left: {cardsLeft}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
                <Box display="flex">
                    <Tooltip title={!hasPassed ? 'Active' : 'Passed'}>
                        <BlockIcon
                            fontSize="small"
                            sx={{
                                color: passedIconColor,
                            }}
                        />
                    </Tooltip>
                </Box>
                <Box>
                    {trophyColor && (
                        <TrophyIcon width="24px" color={trophyColor} />
                    )}
                </Box>
            </Box>
        </Box>
    );
};
