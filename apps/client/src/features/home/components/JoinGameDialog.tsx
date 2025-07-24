import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
    Box,
    Button,
    Dialog,
    DialogProps,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    useTheme,
    TextField,
} from '@mui/material';

import { GAME_PATHS } from '../../../router/routes';

const validateRoomCode = (roomCode: string) => {
    return /^[a-z]{6}$/.test(roomCode);
};

export interface JoinRoomDialogProps {
    isOpen: DialogProps['open'];
    onClose: () => void;
}

export const JoinRoomDialog = ({ isOpen, onClose }: JoinRoomDialogProps) => {
    const [roomCode, setRoomCode] = useState('');

    const { palette } = useTheme();
    const navigate = useNavigate();

    const isValidRoomCode = validateRoomCode(roomCode);

    return (
        <Dialog open={isOpen} onClose={() => onClose()}>
            <Box
                sx={{
                    border: '3px solid transparent',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: palette.background.default,
                    color: '#F4F5FA',
                    padding: '12px 8px',
                }}
            >
                <DialogTitle sx={{ paddingBottom: '20px' }}>
                    <Typography fontWeight="bold">Join Room</Typography>
                </DialogTitle>
                <DialogContent
                    sx={{
                        width: '300px',
                        paddingBottom: '16px',
                    }}
                >
                    <Box paddingY="8px">
                        <TextField
                            fullWidth
                            label="Room Code"
                            onChange={(e) => setRoomCode(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        paddingX: '24px',
                    }}
                >
                    <Button
                        fullWidth
                        variant="outlined"
                        disabled={!isValidRoomCode}
                        onClick={() =>
                            navigate(GAME_PATHS.ROOM.getResolvedPath(roomCode))
                        }
                    >
                        Join
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => onClose()}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};
