import './App.css'
import axios from 'axios'
import { Box, Button, Input } from '@mui/material'

function App() {
  const handleCreateGame = async () => {
    const response = await axios.get("http://localhost:3000/create");
    console.log(response);
  }

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
  )
}

export default App
