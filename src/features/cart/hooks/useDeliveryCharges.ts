import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";

/**
 * Single source of truth for delivery and handling charges.
 *
 * Values come from the admin panel only — no hardcoded pricing, so a change in
 * admin takes effect without an app release. Until the settings land, `isReady`
 * is false and the charges read 0: callers must gate their checkout CTA on it
 * rather than present those zeros as a real total.
 */
export const useDeliveryCharges = (subtotal: number) => {
  const { data: settings } = useCartWalletSettings();
  const cart = settings?.cart;
  const isReady = !!cart;

  const freeDeliveryThreshold = cart?.freeDeliveryAbove ?? 0;
  const deliveryFee =
    !isReady || subtotal >= freeDeliveryThreshold
      ? 0
      : (cart?.standardDeliveryCharge ?? 0);
  const handlingCharge = isReady ? (cart?.handlingCharge ?? 0) : 0;

  const remainingForFreeDelivery = Math.max(
    0,
    freeDeliveryThreshold - subtotal,
  );
  const freeDeliveryProgress =
    freeDeliveryThreshold > 0
      ? Math.min(1, subtotal / freeDeliveryThreshold)
      : 0;

  return {
    isReady,
    deliveryFee,
    handlingCharge,
    freeDeliveryThreshold,
    remainingForFreeDelivery,
    freeDeliveryProgress,
  };
};
