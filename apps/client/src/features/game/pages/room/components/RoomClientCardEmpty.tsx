import { Box, Typography, useTheme } from '@mui/material';

export const RoomClientCardEmpty = () => {
    const { palette } = useTheme();

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="8px"
            width="250px"
            height="84px"
            border={`1px solid ${palette.secondary.main}`}
            padding="8px 16px"
        >
            <Typography fontSize="24px">Empty</Typography>
        </Box>
    );
};
