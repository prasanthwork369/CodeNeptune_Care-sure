import { create } from 'zustand';

interface CartPendingState {
    pendingIds: Record<string, boolean>;
    setPending: (id: string, pending: boolean) => void;
}

export const useCartPendingStore = create<CartPendingState>((set) => ({
    pendingIds: {},
    setPending: (id, pending) => set((s) => ({
        pendingIds: { ...s.pendingIds, [id]: pending },
    })),
}));

