import { Box } from '@mui/material';
import galaxyBg from '../../../../assets/galaxy-bg.jpg';

import { WIDTH_TO_HEIGHT_RATIO } from './constants';

interface PlayingCardBackProps {
    widthInPx: number;
}

export const PlayingCardBack = ({ widthInPx }: PlayingCardBackProps) => {
    const heightInPx = widthInPx / WIDTH_TO_HEIGHT_RATIO;
    const borderRadiusInPx = widthInPx / 6;

    return (
        <Box
            width={`${widthInPx}px`}
            height={`${heightInPx}px`}
            borderRadius={`${borderRadiusInPx}px`}
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
        >
            <img
                src={galaxyBg}
                alt="Card Back Art"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'right center',
                }}
            />
        </Box>
    );
};
