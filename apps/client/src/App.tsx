import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import axios from 'axios';

import getTheme from './theme';
import { BACKEND_URL } from './config';
import { NavBar } from './components/NavBar';
import { LoadingServer } from './components/LoadingServer';
import { ServerError } from './components/ServerError';
import { AppRouter } from './router/AppRouter';

const SERVER_CHECK_FREQUENCY = 3000; // 3 seconds

const MainContent = () => {
    const [isServerReady, setIsServerReady] = useState(false);
    const [error, setError] = useState<boolean>(false);
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        const loadingTimer = setTimeout(() => {
            setShowLoading(true);
        }, 300);

        let retries = 0;

        const checkServer = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/ping`, {
                    timeout: SERVER_CHECK_FREQUENCY,
                });

                if (res.status === 200) {
                    setIsServerReady(true);
                } else {
                    setError(true);
                }
            } catch (err) {
                if (axios.isCancel(err)) {
                    if (retries >= 5) {
                        setError(true);
                    } else {
                        console.warn('Server check failed, retrying...');
                        retries++;
                        checkServer();
                    }
                } else {
                    setError(true);
                }
            }
        };
        checkServer();

        return () => {
            clearTimeout(loadingTimer);
        };
    }, []);

    if (error) {
        return <ServerError />;
    }

    if (!isServerReady) {
        if (showLoading) {
            return <LoadingServer />;
        }

        return null;
    }

    return <AppRouter />;
};

const App: React.FC = () => {
    const theme = getTheme();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Box display="flex" flexDirection="column" height="100vh">
                    <NavBar />
                    <Box flexGrow="1">
                        <Suspense fallback={<LoadingServer />}>
                            <MainContent />
                        </Suspense>
                    </Box>
                </Box>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
