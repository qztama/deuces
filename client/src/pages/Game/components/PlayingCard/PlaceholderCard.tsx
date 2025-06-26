import { Box, BoxProps, Typography, useTheme } from '@mui/material';

import { WIDTH_TO_HEIGHT_RATIO } from './constants';

export interface PlaceholderCardProps extends Pick<BoxProps, 'sx'> {
    widthInPx: number;
    label?: string;
}

export const PlaceholderCard = (props: PlaceholderCardProps) => {
    const { palette } = useTheme();
    const { label = 'Placeholder', widthInPx, sx = {} } = props;
    const height = widthInPx / WIDTH_TO_HEIGHT_RATIO;

    return (
        <Box
            borderRadius="4px"
            sx={{
                ...sx,
                border: `3px dotted ${palette.secondary.dark}`,
            }}
        >
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                borderRadius="4px"
                width={widthInPx}
                height={height}
            >
                <Typography>{label}</Typography>
            </Box>
        </Box>
    );
};
