import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import './index.css';
import GameRoom from './pages/Game';
import Home from './pages/Home.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/room/:roomCode" element={<GameRoom />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
