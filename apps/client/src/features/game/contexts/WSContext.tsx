import {
    createContext,
    useContext,
    useRef,
    useEffect,
    useCallback,
    useState,
} from 'react';
import { WSMessageMap, WSMessage } from '@deuces/shared';
import { useWSErrorHandler } from '../hooks/useWSErrorHandler';

import { WS_URL } from '@/config';

type SubscriptionMap = Map<
    keyof WSMessageMap,
    Set<
        {
            [K in keyof WSMessageMap]: WSMessageMap[K] extends {
                payload: infer P;
            }
                ? (payload: P) => void
                : () => void;
        }[keyof WSMessageMap] // this turns it back into a union of functions
    >
>;

interface WSContextType {
    socket: WebSocket | null;
    connectionStatus: 'connecting' | 'open' | 'closed' | 'error';
    subscribe: <K extends keyof WSMessageMap>(
        type: K,
        callback: WSMessageMap[K] extends {
            payload: infer P;
        }
            ? (payload: P) => void
            : () => void
    ) => () => void;
    sendMessage: <K extends keyof WSMessageMap>(
        type: K,
        ...[payload]: WSMessageMap[K] extends { payload: infer P }
            ? [payload: P]
            : []
    ) => void;
}

const WSContext = createContext<WSContextType | undefined>(undefined);

export const WSContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const socketRef = useRef<WebSocket | null>(null);
    const hasConnectedRef = useRef(false);
    const subscriptionsRef = useRef<SubscriptionMap>(new Map());
    const [connectionStatus, setConnectionStatus] =
        useState<WSContextType['connectionStatus']>('connecting');

    const errorToast = useWSErrorHandler();

    useEffect(() => {
        if (socketRef.current) {
            return;
        }

        const socket = new WebSocket(WS_URL);
        socketRef.current = socket;

        let unsubscribeWSError: (() => void) | null = null;
        socket.onopen = () => {
            console.log('WebSocket Connected');
            hasConnectedRef.current = true;
            setConnectionStatus('open');

            if (!subscriptionsRef.current.has('error')) {
                unsubscribeWSError = subscribe('error', ({ type, message }) => {
                    console.log('type', type, 'message', message);
                    if (type === 'Join Room Error') {
                        setConnectionStatus('error');
                    } else {
                        errorToast({ type, message });
                    }
                });
            }
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WSMessage;
                dispatchMessage(message);
            } catch (err) {
                console.error('WebSocket message parse error', err);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket Disconnected');
            setConnectionStatus('closed');
        };

        socket.onerror = (err) => {
            console.log('WebSocket Error');
            setConnectionStatus('error');
        };

        return () => {
            // ✅ Only close if the socket actually connected
            if (
                hasConnectedRef.current &&
                socket.readyState < WebSocket.CLOSING
            ) {
                console.log('Cleaning up WebSocket');
                socket.close();
            }
            socketRef.current = null;
            hasConnectedRef.current = false;

            if (unsubscribeWSError) {
                unsubscribeWSError();
            }
        };
    }, [errorToast]);

    const dispatchMessage = (message: WSMessage) => {
        const handlers = subscriptionsRef.current.get(
            message.type as keyof WSMessageMap
        );
        if (!handlers) return;

        const payload = (message as any).payload;

        handlers.forEach((cb: any) => {
            if (payload !== undefined) {
                cb(payload);
            } else {
                cb();
            }
        });
    };

    const subscribe = useCallback(
        <K extends keyof WSMessageMap>(
            type: K,
            callback: WSMessageMap[K] extends { payload: infer P }
                ? (payload: P) => void
                : () => void
        ): (() => void) => {
            let set = subscriptionsRef.current.get(type);
            if (!set) {
                set = new Set();
                subscriptionsRef.current.set(type, set);
            }
            set.add(callback as any);

            return () => {
                set!.delete(callback as any);
                if (set.size === 0) {
                    subscriptionsRef.current.delete(type);
                }
            };
        },
        []
    );

    const sendMessage = useCallback(
        <K extends keyof WSMessageMap>(
            type: K,
            ...[payload]: WSMessageMap[K] extends { payload: infer P }
                ? [payload: P]
                : []
        ): void => {
            const message =
                payload !== undefined ? { type, payload } : { type };

            if (socketRef.current) {
                socketRef.current.send(JSON.stringify(message));
            }
        },
        []
    );

    return (
        <WSContext.Provider
            value={{
                socket: socketRef.current,
                connectionStatus,
                subscribe,
                sendMessage,
            }}
        >
            {children}
        </WSContext.Provider>
    );
};

export const useWSContext = () => {
    const ctx = useContext(WSContext);
    if (!ctx)
        throw new Error('useWebSocketContext must be used within a provider');
    return ctx;
};
