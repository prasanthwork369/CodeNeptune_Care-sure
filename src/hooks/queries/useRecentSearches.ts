import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'recent_searches';
const MAX = 8;

export const useRecentSearches = () => {
    const [recents, setRecents] = useState<string[]>([]);

    useEffect(() => {
        SecureStore.getItemAsync(KEY).then(raw => {
            if (raw) setRecents(JSON.parse(raw));
        });
    }, []);

    const add = useCallback(async (term: string) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        setRecents(prev => {
            const next = [trimmed, ...prev.filter(r => r !== trimmed)].slice(0, MAX);
            SecureStore.setItemAsync(KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const clear = useCallback(async () => {
        setRecents([]);
        await SecureStore.deleteItemAsync(KEY);
    }, []);

    return { recents, add, clear };
};
