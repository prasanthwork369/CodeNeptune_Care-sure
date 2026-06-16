import { create } from 'zustand';

export interface PrescriptionOrderItem {
  medicineId: string;
  medicineName: string;
  medicineSlug: string;
  unitPrice: number;
  mrp: number;
  discountPercent: number;
  quantity: number;
  image: string | null;
  productId: string | null;
}

interface PrescriptionOrderState {
  items: PrescriptionOrderItem[];
  setItems: (items: PrescriptionOrderItem[]) => void;
  clear: () => void;
}

export const usePrescriptionOrderStore = create<PrescriptionOrderState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  clear: () => set({ items: [] }),
}));
