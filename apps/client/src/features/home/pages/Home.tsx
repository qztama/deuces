import { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Box, Button, Typography } from '@mui/material';

import { BACKEND_URL } from '@/config';
import { HOME_PATHS } from '@/router/routes';
import { JoinRoomDialog } from '../components/JoinGameDialog';

const Home = () => {
    const navigate = useNavigate();
    const [isJoinRoomDialogOpen, setIsJoinRoomDialogOpen] = useState(false);

    const handleCreateGame = async () => {
        const { data } = await axios.get(`${BACKEND_URL}/create`);
        console.log(data);
        navigate(`/room/${data.roomCode}`);
    };

    const handleHowToPlayClick = () => {
        navigate(HOME_PATHS.HOW_TO_PLAY.getResolvedPath());
    };

    return (
        <>
            <JoinRoomDialog
                isOpen={isJoinRoomDialogOpen}
                onClose={() => setIsJoinRoomDialogOpen(false)}
            />
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="80%"
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    width="20%"
                    gap="16px"
                >
                    <Typography variant="h1" sx={{ textAlign: 'center' }}>
                        Deuces
                    </Typography>
                    <Box display="flex" flexDirection="column" gap="8px">
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleCreateGame}
                        >
                            Create Game
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setIsJoinRoomDialogOpen(true)}
                        >
                            Join Game
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleHowToPlayClick}
                        >
                            How to Play
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default Home;
