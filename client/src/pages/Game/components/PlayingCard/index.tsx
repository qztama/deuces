import { Box, Typography } from '@mui/material';
import { Rank, Suit } from '@shared/game';

import { SuitIcon } from '../SuitIcon';
import {
    WIDTH_TO_HEIGHT_RATIO,
    FACE_ICON_TO_WIDTH_RATIO,
    PIP_POSITIONS,
    FACE_SVG_MAP,
    LABEL_TO_WIDTH_RATIO,
} from './constants';

interface PlayingCardProps {
    rank: Rank;
    suit: Suit;
    width?: number; // in px
}

const PipLayout = ({
    rank,
    suit,
    fill,
}: {
    rank: Exclude<Rank, 'J' | 'Q' | 'K'>;
    suit: Suit;
    fill: string;
}) => {
    const pipCols = PIP_POSITIONS[rank] || [];
    const colGap = pipCols.length === 2 ? '24px' : undefined;

    return (
        <Box
            display="flex"
            width="100%"
            height="100%"
            justifyContent="center"
            gap={colGap}
            paddingTop="16px"
            paddingBottom="16px"
        >
            {pipCols.map((col) => (
                <Box
                    display="flex"
                    flexDirection="column"
                    height="100%"
                    justifyContent="space-around"
                >
                    {col.map((isFlipped) => {
                        if (isFlipped === undefined) {
                            // put in placeholder
                            return <Box width="16px" height="16px" />;
                        }

                        return (
                            <SuitIcon
                                suit={suit}
                                fill={fill}
                                size="36px"
                                isFlipped={isFlipped}
                            />
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
};

const FaceLayout = ({
    rank,
    fill,
    iconSize,
}: {
    rank: Extract<Rank, 'J' | 'Q' | 'K'>;
    suit: Suit;
    fill: string;
    iconSize: number;
}) => {
    let FaceSvgComp = FACE_SVG_MAP[rank];

    return (
        <Box
            display="flex"
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
        >
            <FaceSvgComp fill={fill} width={`${iconSize}px`} />
        </Box>
    );
};

function isFaceCard(rank: Rank): rank is 'J' | 'Q' | 'K' {
    return ['J', 'Q', 'K'].includes(rank);
}

export const PlayingCard = (props: PlayingCardProps) => {
    const { rank, suit, width = 160 } = props;
    const height = width / WIDTH_TO_HEIGHT_RATIO;
    const labelSize = width * LABEL_TO_WIDTH_RATIO;
    const rankLabel = rank === 'T' ? '10' : rank;
    const suitColor = ['D', 'H'].includes(suit) ? 'red' : 'black';

    return (
        <Box
            borderRadius="4px"
            display="flex"
            flexDirection="column"
            width={width}
            height={height}
            borderColor="black"
            bgcolor="white"
            position="relative"
            justifyContent="space-between"
        >
            <Box padding="4px">
                <Box
                    display="flex"
                    flexDirection="column"
                    width="fit-content"
                    alignItems="center"
                >
                    <Typography
                        fontSize={`${labelSize}px`}
                        color={suitColor}
                        width="fit-content"
                    >
                        {rankLabel}
                    </Typography>
                    <SuitIcon
                        fill={suitColor}
                        suit={suit}
                        size={`${labelSize}px`}
                    />
                </Box>
            </Box>
            <Box
                width="100%"
                height="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                position="absolute"
            >
                {isFaceCard(rank) ? (
                    <FaceLayout
                        suit={suit}
                        rank={rank}
                        fill={suitColor}
                        iconSize={FACE_ICON_TO_WIDTH_RATIO * width}
                    />
                ) : (
                    <PipLayout rank={rank} suit={suit} fill={suitColor} />
                )}
            </Box>
            <Box display="flex" flexDirection="row-reverse" padding="4px">
                <Box
                    display="flex"
                    flexDirection="column"
                    width="fit-content"
                    alignItems="center"
                    sx={{ transform: 'rotate(180deg)' }}
                >
                    <Typography
                        fontSize={`${labelSize}px`}
                        color={suitColor}
                        width="fit-content"
                    >
                        {rankLabel}
                    </Typography>
                    <SuitIcon
                        fill={suitColor}
                        suit={suit}
                        size={`${labelSize}px`}
                    />
                </Box>
            </Box>
        </Box>
    );
};
