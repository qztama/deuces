import React from 'react';
import { BrowserRouter } from 'react-router';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';

import getTheme from './theme';
import { NavBar } from './components/NavBar';
import { AppRouter } from './router/AppRouter';

const App: React.FC = () => {
    const theme = getTheme('dark');

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Box display="flex" flexDirection="column" height="100vh">
                    <NavBar />
                    <Box flexGrow="1">
                        <AppRouter />
                    </Box>
                </Box>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
