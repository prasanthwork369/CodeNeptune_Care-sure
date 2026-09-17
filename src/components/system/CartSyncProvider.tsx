import { useCartSocketSync } from "@/src/features/cart/hooks/useCartSocketSync";

export const CartSyncProvider = () => {
  useCartSocketSync();
  return null;
};
