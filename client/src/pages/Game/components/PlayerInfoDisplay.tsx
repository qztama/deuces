import { Box, Avatar, Typography, Tooltip, useTheme } from '@mui/material';
import TrophyIcon from '../../../assets/icons/trophy.svg?react';

import BlockIcon from '@mui/icons-material/Block';

interface PlayerInfoDisplayProps {
    id: string;
    name?: string;
    cardsLeft: number;
    hasPassed: boolean;
    isTurn: boolean;
}

export const PlayerInfoDisplay = ({
    name,
    cardsLeft,
    hasPassed,
    isTurn,
}: PlayerInfoDisplayProps) => {
    const theme = useTheme();
    const passedIconColor = hasPassed ? 'red' : 'grey';
    const borderColor = isTurn
        ? theme.palette.primary.main
        : theme.palette.secondary.main;

    const initials = name?.split(' ').reduce((acc, cur) => {
        acc += cur.charAt(0).toUpperCase();
        return acc;
    }, '');

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
            <Box display="flex">
                <Tooltip title={!hasPassed ? 'Active' : 'Passed'}>
                    <BlockIcon
                        fontSize="small"
                        sx={{
                            color: passedIconColor,
                        }}
                    />
                </Tooltip>
                <TrophyIcon width="24px" color={theme.palette.rank.silver} />
            </Box>
        </Box>
    );
};
