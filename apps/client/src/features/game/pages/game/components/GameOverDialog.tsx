import { useNavigate } from 'react-router';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    useTheme,
    darken,
} from '@mui/material';
import { ObfuscatedPlayer } from '@deuces/shared';

import { useRoomContext } from '../../../contexts/RoomContext';
import { useGameContext } from '../../../contexts/GameContext';

export const GameOverDialog = () => {
    const navigate = useNavigate();

    const { palette } = useTheme();
    const { roomCode } = useRoomContext();
    const { isGameOver, players, winners } = useGameContext();

    const lastPlacePlayer = players.find(
        ({ id }) => !winners.map(({ id }) => id).includes(id)
    );
    const playersByPlacement: ObfuscatedPlayer[] = [
        ...winners,
        ...(lastPlacePlayer ? [lastPlacePlayer] : []),
    ];
    const standings = playersByPlacement.map(({ id, name }, idx) => {
        const placement = idx + 1;
        const placementColor = (() => {
            switch (placement) {
                case 1:
                    return palette.rank.gold;
                case 2:
                    return palette.rank.silver;
                case 3:
                    return palette.rank.bronze;
                default:
                    return 'grey';
            }
        })();

        return (
            <Box
                key={id}
                display="flex"
                gap="8px"
                paddingX="8px"
                paddingY="8px"
                alignItems="center"
                // borderRadius="12px"
            >
                <Box
                    borderRadius="50%"
                    width="32px"
                    height="32px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        backgroundColor: darken(placementColor, 0.2),
                        border: `4px solid ${placementColor}`,
                    }}
                >
                    <Typography fontWeight="bold">{placement}</Typography>
                </Box>
                <Typography fontWeight="bold">{name}</Typography>
            </Box>
        );
    });

    return (
        <Dialog open={isGameOver} keepMounted>
            <Box
                sx={{
                    border: '3px solid transparent',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundImage: `
                        linear-gradient(${palette.background.default}, ${palette.background.default}),
                        linear-gradient(180deg, #6C6FAE, #A3A8D1)
                    `,
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    color: '#F4F5FA',
                    padding: '12px 8px',
                }}
            >
                <DialogTitle>
                    <Typography fontWeight="bold">FINAL STANDINGS</Typography>
                </DialogTitle>
                <DialogContent
                    sx={{
                        marginX: '16px',
                        marginBottom: '4px',
                        borderRadius: '8px',
                        padding: 0,
                        '& > div:nth-of-type(even)': {
                            backgroundColor: palette.primary.main,
                        },
                        '& > div:nth-of-type(odd)': {
                            backgroundColor: palette.secondary.main,
                        },
                    }}
                >
                    {standings}
                </DialogContent>
                <DialogActions
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-around',
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => {
                            navigate(`/room/${roomCode}`);
                        }}
                    >
                        Back to Room
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};
