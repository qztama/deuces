import { Routes, Route } from 'react-router';

import { Home as HomePage } from '../features/home/pages/Home';
import { HowToPlay as HowToPlayPage } from '../features/home/pages/HowToPlay';
import { GameLayout } from '../pages/Game/GameLayout';
import { GameInterstitial } from '../pages/Game/GameInterstitial';
import { Room } from '../pages/Game/Room';
import { GameView } from '../pages/Game/GameView';
import { Settings } from '../features/settings/pages/Settings';

import { PATHS } from './routes';

export const AppRouter = () => {
    return (
        <Routes>
            <Route path={PATHS.HOME.path} element={<HomePage />} />
            <Route path={PATHS.HOW_TO_PLAY.path} element={<HowToPlayPage />} />
            <Route path={PATHS.ROOM.path} element={<GameLayout />}>
                <Route element={<GameInterstitial />}>
                    <Route index element={<Room />} />
                    <Route path="game" element={<GameView />} />
                </Route>
            </Route>
            <Route path={PATHS.SETTINGS.path} element={<Settings />} />
        </Routes>
    );
};
