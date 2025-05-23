import axios from 'axios';
import { useNavigate } from 'react-router';
import { Box, Button, Input } from '@mui/material';

function Home() {
    const navigate = useNavigate();

    const handleCreateGame = async () => {
        const { data } = await axios.get('http://localhost:3000/create');
        console.log(data);
        navigate(`/room/${data.roomCode}`);
    };

    return (
        <>
            <h1>Deuces</h1>
            <Box>
                <Button onClick={handleCreateGame}>Create Game</Button>

                <Box display="flex">
                    <Button>Join Game</Button>
                    <Input />
                </Box>
            </Box>
        </>
    );
}

export default Home;
