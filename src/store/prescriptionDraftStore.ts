import { PrescriptionItem } from "@/src/types/prescription";
import { MAX_FILES } from "@/src/utils/prescription";
import { create } from "zustand";

interface PrescriptionDraftState {
  items: PrescriptionItem[];
  addItems: (incoming: PrescriptionItem[]) => void;
  removeItem: (index: number) => void;
  clearItems: () => void;
}

export const usePrescriptionDraftStore = create<PrescriptionDraftState>(
  (set, get) => ({
    items: [],
    addItems: (incoming) => {
      const currentItems = get().items;
      const seen = new Set(
        currentItems.map((it) => `${it.name}_${it.size ?? 0}_${it.type}`),
      );
      const uniqueToAdd: PrescriptionItem[] = [];

      for (const item of incoming) {
        const key = `${item.name}_${item.size ?? 0}_${item.type}`;
        if (!seen.has(key)) {
          uniqueToAdd.push(item);
          seen.add(key);
        }
      }

      if (uniqueToAdd.length > 0) {
        const merged = [...currentItems, ...uniqueToAdd];
        set({ items: merged.slice(0, MAX_FILES) });
      }
    },
    removeItem: (index) =>
      set((state) => ({ items: state.items.filter((_, i) => i !== index) })),
    clearItems: () => set({ items: [] }),
  }),
);
