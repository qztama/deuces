// App.tsx
import React, { useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider, CssBaseline, Button, Box } from '@mui/material';

import getTheme from './theme';
import { NavBar } from './components/NavBar';
import Home from './pages/Home';
import GameRoom from './pages/Game';

const App: React.FC = () => {
    const [mode, setMode] = useState<'light' | 'dark'>('dark');
    const theme = useMemo(() => getTheme(mode), [mode]);

    const toggleTheme = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Box>
                    <NavBar mode={mode} toggleTheme={toggleTheme} />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/room/:roomCode" element={<GameRoom />} />
                    </Routes>
                </Box>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
