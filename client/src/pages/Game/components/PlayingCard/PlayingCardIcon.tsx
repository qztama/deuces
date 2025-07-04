import { Box, Typography } from '@mui/material';

import { Rank, Suit } from '@shared/game/types';

import { SuitIcon } from '../SuitIcon';
import { WIDTH_TO_HEIGHT_RATIO } from './constants';

interface PlayingCardIconProps {
    rank: Rank;
    suit: Suit;
    widthInPx: number;
}

export const PlayingCardIcon = ({
    rank,
    suit,
    widthInPx,
}: PlayingCardIconProps) => {
    const heightInPx = widthInPx / WIDTH_TO_HEIGHT_RATIO;
    const suitColor = ['D', 'H'].includes(suit) ? 'red' : 'black';
    const labelSizeInPx = heightInPx / 2;
    const borderRadiusInPx = widthInPx / 6;

    return (
        <Box
            width={`${widthInPx}px`}
            height={`${heightInPx}px`}
            borderRadius={`${borderRadiusInPx}px`}
            display="flex"
            flexDirection="column"
            bgcolor="white"
            justifyContent="center"
            alignItems="center"
        >
            <Typography
                fontSize={`${(8 * labelSizeInPx) / 9}px`}
                color={suitColor}
                lineHeight={`${(8 * labelSizeInPx) / 9}px`}
            >
                {rank === 'T' ? 10 : rank}
            </Typography>
            <SuitIcon
                suit={suit}
                size={`${labelSizeInPx}px`}
                fill={suitColor}
            />
        </Box>
    );
};
