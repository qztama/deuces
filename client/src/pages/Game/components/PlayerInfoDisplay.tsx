import { Box, Avatar, Typography, Tooltip, useTheme } from '@mui/material';

import BlockIcon from '@mui/icons-material/Block';

interface PlayerInfoDisplayProps {
    id: string;
    name?: string;
    cardsLeft: number;
    hasPassed: boolean;
}

export const PlayerInfoDisplay = ({
    id,
    name,
    cardsLeft,
    hasPassed,
}: PlayerInfoDisplayProps) => {
    const theme = useTheme();
    const passedIconColor = hasPassed ? 'red' : 'grey';

    return (
        <Box
            borderRadius="2px"
            width="200px"
            border={`1px solid ${theme.palette.secondary.main}`}
            padding="8px"
            flexDirection="column"
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                paddingBottom="8px"
            >
                <Avatar>TZ</Avatar>
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
            </Box>
        </Box>
    );
};
