import { usePrescriptions } from "@/src/hooks/queries/usePrescriptions";

/**
 * Resolves the prescription id for the medicine-comparison screen. Some entry
 * points (notifications) only know the prescriptionOrderId — look the
 * prescription up from the cached list so the refill reminder still works.
 */
export function useComparisonPrescriptionId(
  prescriptionId?: string,
  prescriptionOrderId?: string,
): string | undefined {
  // Hooks can't be conditional — always call; the list query is cached/shared.
  const { prescriptions } = usePrescriptions({});
  if (prescriptionId) return prescriptionId;
  if (!prescriptionOrderId) return undefined;
  return prescriptions.find(
    (p) => p.prescriptionOrderId === prescriptionOrderId,
  )?.id;
}
