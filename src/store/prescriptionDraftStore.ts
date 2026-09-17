import { PrescriptionItem } from "@/src/features/prescription/types";
import { MAX_FILES_CEILING } from "@/src/features/prescription/utils/prescription";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PrescriptionDraftState {
  items: PrescriptionItem[];
  addItems: (incoming: PrescriptionItem[]) => void;
  removeItem: (index: number) => void;
  clearItems: () => void;
  updateItem: (
    index: number,
    updates: Partial<
      Pick<
        PrescriptionItem,
        "uploadedUrl" | "uploadStatus" | "uploadError"
      >
    >,
  ) => void;
}

// Persisted so images already picked (but not yet submitted at payment)
// survive a process recreation — e.g. the user leaves mid-upload to change a
// permission in Settings and the app is killed in the background.
export const usePrescriptionDraftStore = create<PrescriptionDraftState>()(
  persist(
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
            // New items explicitly start with pending status unless already specified
            uniqueToAdd.push({
              ...item,
              uploadStatus: item.uploadStatus ?? "pending",
            });
            seen.add(key);
          }
        }

        if (uniqueToAdd.length > 0) {
          const merged = [...currentItems, ...uniqueToAdd];
          // Last-resort guard only. Callers enforce the admin-configured limit;
          // capping at the default here would silently undo a raised setting.
          set({ items: merged.slice(0, MAX_FILES_CEILING) });
        }
      },
      removeItem: (index) =>
        set((state) => ({ items: state.items.filter((_, i) => i !== index) })),
      clearItems: () => set({ items: [] }),
      updateItem: (index, updates) =>
        set((state) => {
          const items = [...state.items];
          if (items[index]) {
            items[index] = { ...items[index], ...updates };
          }
          return { items };
        }),
    }),
    {
      name: "caresure-prescription-draft",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
