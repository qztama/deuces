import { Box, Typography, Icon, useTheme } from '@mui/material';
import {
    PersonOutline as PersonOutlineIcon,
    ThumbUpOffAlt as ThumbUpIcon,
} from '@mui/icons-material';
import { AvatarOptions } from '@deuces/shared';
import { GameAvatar } from '@/components/GameAvatar';

interface RoomClientCardProps {
    name: string;
    avatar: AvatarOptions;
    isHost: boolean;
    isReady: boolean;
    isCurrentPlayer: boolean;
}

export const RoomClientCard = ({
    name,
    avatar,
    isHost,
    isReady,
    isCurrentPlayer,
}: RoomClientCardProps) => {
    const theme = useTheme();

    return (
        <Box
            display="flex"
            justifyContent="space-between"
            borderRadius="8px"
            width="250px"
            height="84px"
            border={`1px solid ${theme.palette.secondary.main}`}
            padding="8px 16px"
        >
            <GameAvatar name={avatar} sizeInPx={64} />

            <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="flex-end"
            >
                <Typography fontSize="24px">{name}</Typography>
                <Box display="flex">
                    {isHost && (
                        <Icon
                            sx={{ fontSize: '24px', color: 'gold' }}
                            className="material-symbols-outlined"
                        >
                            crown
                        </Icon>
                    )}
                    {isCurrentPlayer && <PersonOutlineIcon />}
                    {!isHost && (
                        <ThumbUpIcon
                            sx={{
                                color: isReady ? 'green' : 'grey',
                            }}
                        />
                    )}
                </Box>
            </Box>
        </Box>
    );
};
