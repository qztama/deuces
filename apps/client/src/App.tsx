import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';

import getTheme from './theme';
import { NavBar } from './components/NavBar';
import Home from './pages/Home';
import { GameLayout } from './pages/Game/GameLayout';
import { GameInterstitial } from './pages/Game/GameInterstitial';
import { GameView } from './pages/Game/GameView';
import Room from './pages/Game/Room';
import Settings from './pages/Settings/Settings';

const App: React.FC = () => {
    const theme = getTheme('dark');

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Box display="flex" flexDirection="column" height="100vh">
                    <NavBar />
                    <Box flexGrow="1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/room/:roomCode"
                                element={<GameLayout />}
                            >
                                <Route element={<GameInterstitial />}>
                                    <Route index element={<Room />} />
                                    <Route path="game" element={<GameView />} />
                                </Route>
                            </Route>
                            <Route path="/settings" element={<Settings />} />
                        </Routes>
                    </Box>
                </Box>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
