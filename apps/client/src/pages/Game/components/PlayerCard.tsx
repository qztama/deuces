import { Box, Avatar, Typography, Icon, useTheme } from '@mui/material';

interface PlayerCardProps {
    name: string;
    isHost: boolean;
    isReady: boolean;
    isCurrentPlayer: boolean;
    connectionStatus: string;
}

export const PlayerCard = ({
    name,
    isHost,
    isReady,
    isCurrentPlayer,
    connectionStatus,
}: PlayerCardProps) => {
    const theme = useTheme();

    const initials = name.split(' ').reduce((acc, cur) => {
        acc += cur.charAt(0).toUpperCase();
        return acc;
    }, '');

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
                <Avatar>{initials}</Avatar>
                <Typography>{name}</Typography>
            </Box>
            <Box
                display="flex"
                justifyContent="space-between"
                alignContent="center"
            >
                <Box height="24px">
                    {isHost && (
                        <Icon
                            sx={{ fontSize: '24px', color: 'gold' }}
                            className="material-symbols-outlined"
                        >
                            crown
                        </Icon>
                    )}
                    {isCurrentPlayer && (
                        <Icon
                            className="material-symbols-outlined"
                            sx={{ fontSize: '24px', color: 'grey' }}
                        >
                            person
                        </Icon>
                    )}
                </Box>
                <Box display="flex" alignItems="center" gap="4px">
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor:
                                connectionStatus === 'connected'
                                    ? 'success.main'
                                    : 'warn.main',
                        }}
                    />
                    {connectionStatus === 'connected'
                        ? 'Connected'
                        : 'Disconnected'}
                </Box>
                {isReady && <Box>Ready</Box>}
            </Box>
        </Box>
    );
};
