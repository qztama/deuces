import { useNavigate } from 'react-router';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
} from '@mui/material';
import { ObfuscatedPlayer } from '@shared/game/types';

import { useGameContext } from '../contexts/GameContext';
import { useRoomContext } from '../contexts/RoomContext';

export const GameOverDialog = () => {
    const navigate = useNavigate();

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
        return (
            <Box
                key={id}
                display="flex"
                borderRadius="4px"
                gap="8px"
                paddingY="4px"
                alignItems="center"
            >
                <Box
                    borderRadius="50%"
                    width="32px"
                    height="32px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        backgroundColor: 'gold',
                        border: '4px solid black',
                    }}
                >
                    <Typography>{idx + 1}</Typography>
                </Box>
                <Typography>{name}</Typography>
            </Box>
        );
    });

    return (
        <Dialog open={isGameOver} keepMounted>
            <DialogTitle>FINAL STANDINGS</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" borderRadius="4px">
                    {standings}
                </Box>
            </DialogContent>
            <DialogActions
                sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                }}
            >
                <Button
                    onClick={() => {
                        navigate(`/room/${roomCode}`);
                    }}
                >
                    Back to Room
                </Button>
            </DialogActions>
        </Dialog>
    );
};
