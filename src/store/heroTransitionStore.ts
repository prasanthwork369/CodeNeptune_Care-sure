import { create } from 'zustand';

export interface HeroRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface HeroTransitionStore {
    originRect: HeroRect | null;
    setOriginRect: (rect: HeroRect) => void;
    clear: () => void;
}

export const useHeroTransitionStore = create<HeroTransitionStore>((set) => ({
    originRect: null,
    setOriginRect: (rect) => set({ originRect: rect }),
    clear: () => set({ originRect: null }),
}));
