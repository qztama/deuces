import { Routes, Route } from 'react-router';

import { Suspense, lazy } from 'react';
import { GameLayout } from '@/features/game/components/GameLayout';
import { GameInterstitial } from '@/features/game/components/GameInterstitial';
import { GameView } from '../features/game/pages/game/GameView';
import { Room } from '../features/game/pages/room/Room';

import { PATHS } from './routes';

const HomePage = lazy(() => import('../features/home/pages/Home'));
const HowToPlayPage = lazy(() => import('../features/home/pages/HowToPlay'));
const SettingsPage = lazy(() => import('../features/settings/pages/Settings'));

export const AppRouter = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path={PATHS.HOME.path} element={<HomePage />} />
                <Route
                    path={PATHS.HOW_TO_PLAY.path}
                    element={<HowToPlayPage />}
                />
                <Route path={PATHS.ROOM.path} element={<GameLayout />}>
                    <Route element={<GameInterstitial />}>
                        <Route index element={<Room />} />
                        <Route path="game" element={<GameView />} />
                    </Route>
                </Route>
                <Route path={PATHS.SETTINGS.path} element={<SettingsPage />} />
            </Routes>
        </Suspense>
    );
};
