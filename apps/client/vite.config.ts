import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [react(), svgr()],
    esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
}));
