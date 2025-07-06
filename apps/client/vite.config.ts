import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    // server: {
    //     host: true,
    //     port: 5173,
    //     origin: 'https://8db9-2607-fb90-dd16-c6e1-1d8d-d0bb-ea46-2e8c.ngrok-free.app',
    // },
    resolve: {
        alias: {
            '@shared': path.resolve(__dirname, '../shared'),
        },
    },
});
