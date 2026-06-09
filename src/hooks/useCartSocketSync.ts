import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/src/store/authStore';
import { tokenStorage } from '@/src/lib/storage';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { API_BASE_URL } from '@/src/utils/urls';

export const useCartSocketSync = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }

        let mounted = true;

        const connect = async () => {
            const token = await tokenStorage.get();
            if (!token || !mounted) return;

            const socket: Socket = io(API_BASE_URL, {
                extraHeaders: { Authorization: `Bearer ${token}` },
                transports: ['websocket'],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            socket.on('connect', () => {
                if (__DEV__) console.log('[CartSocket] Connected');
            });

            socket.on('connect_error', (err) => {
                if (__DEV__) console.warn('[CartSocket] Error:', err.message);
            });

            socket.on('cart_update', (data: { action: string; cart: any }) => {
                if (data?.cart) {
                    queryClient.setQueryData(QUERY_KEYS.CUSTOMER.CART, data.cart);
                }
            });

            socket.on('disconnect', (reason) => {
                if (__DEV__) console.log('[CartSocket] Disconnected:', reason);
            });

            socketRef.current = socket;
        };

        connect();

        return () => {
            mounted = false;
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated, queryClient]);
};
