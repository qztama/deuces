export const HOME_PATHS = {
    HOME: {
        path: '/',
        getResolvedPath: function () {
            return '/';
        },
    },
    HOW_TO_PLAY: {
        path: '/how-to-play',
        getResolvedPath: function () {
            return '/how-to-play';
        },
    },
} as const;

export const GAME_PATHS = {
    ROOM: {
        path: '/room/:roomCode',
        getResolvedPath: function (roomCode: string) {
            return `/room/${roomCode}`;
        },
    },
    GAME: {
        path: '/room/:roomCode/game',
        getResolvedPath: function (roomCode: string) {
            return `/room/${roomCode}/game`;
        },
    },
} as const;

export const SETTINGS_PATHS = {
    SETTINGS: {
        path: '/settings',
        getResolvedPath: function () {
            return '/settings';
        },
    },
} as const;

export const PATHS = {
    ...HOME_PATHS,
    ...GAME_PATHS,
    ...SETTINGS_PATHS,
} as const;
