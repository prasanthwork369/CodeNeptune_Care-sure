import { prescriptionService } from "@/src/services/prescription.service";
import { PrescriptionReminder, ReminderInput } from "@/src/types/prescription";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useNav } from "./useNav";
import { logger } from "@/src/utils/logger";

interface UseRefillReminderOptions {
  prescriptionId?: string;
  /** When set, hydration uses GET /prescriptions/order/{id} — the only detail endpoint that returns `reminder` (same as web). */
  prescriptionOrderId?: string;
  /** Pass when the caller already has the reminder (list rows); omit to fetch it. */
  initialReminder?: PrescriptionReminder | null;
}

/**
 * Owns the "Never Miss a Refill" reminder state for one prescription:
 * hydration, set/cancel API calls, and the Health-Updates-disabled guard.
 * Mirrors the customer-website flow (PUT/DELETE /prescriptions/{id}/reminder).
 */
export function useRefillReminder({
  prescriptionId,
  prescriptionOrderId,
  initialReminder,
}: UseRefillReminderOptions) {
  const router = useNav();
  const queryClient = useQueryClient();
  const [reminder, setReminderState] = useState<PrescriptionReminder | null>(
    initialReminder ?? null,
  );
  const [loading, setLoading] = useState(false);

  // Cached prescription lists/details predate the change — refetch so a
  // reopened screen shows the saved toggle state instead of stale cache.
  const invalidatePrescriptions = () => {
    queryClient
      .invalidateQueries({ queryKey: ["customer", "prescriptions"] })
      .catch(() => {});
  };

  // Hydrate from the server only when the caller didn't supply the reminder.
  // Prefer the by-order endpoint: getById's response omits `reminder`.
  useEffect(() => {
    if (!prescriptionId || initialReminder !== undefined) return;
    let cancelled = false;
    const fetchDetail = prescriptionOrderId
      ? prescriptionService.getByOrderNumber(prescriptionOrderId)
      : prescriptionService.getById(prescriptionId);
    fetchDetail.then((res) => {
      if (__DEV__)
        logger.debug(
          "[RefillReminder] hydrate:",
          res.success
            ? JSON.stringify(res.data.reminder ?? "NO reminder field")
            : `failed: ${res.error}`,
        );
      if (!cancelled && res.success)
        setReminderState(res.data.reminder ?? null);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptionId, prescriptionOrderId]);

  const isActive = reminder?.status === "active";
  const nextRemindDate = reminder?.nextRemindAt
    ? new Date(reminder.nextRemindAt)
    : null;

  // Reminders deliver via Health Updates notifications — when those are off the
  // backend refuses, and we route the user to the settings screen to opt in.
  const showHealthUpdatesAlert = () => {
    Alert.alert(
      "Turn on Health Updates",
      "Refill reminders are sent via Health Updates notifications, and yours are currently off. Enable them in your notification settings to start getting refill reminders.",
      [
        { text: "Maybe later", style: "cancel" },
        {
          text: "Go to Settings",
          onPress: () => router.push("/profile/support/notifications"),
        },
      ],
    );
  };

  const setReminder = async (input: ReminderInput): Promise<boolean> => {
    if (!prescriptionId || loading) return false;
    setLoading(true);
    const res = await prescriptionService.setReminder(prescriptionId, input);
    setLoading(false);
    if (res.success) {
      setReminderState(res.data);
      invalidatePrescriptions();
      return true;
    }
    // Surface the real backend error while debugging integration.
    if (__DEV__)
      logger.debug("[RefillReminder] setReminder failed:", JSON.stringify(res));
    if (res.code === "HEALTH_UPDATES_DISABLED") showHealthUpdatesAlert();
    else Alert.alert("Reminder", "Failed to set reminder. Please try again.");
    return false;
  };

  const cancelReminder = async (): Promise<boolean> => {
    if (!prescriptionId || loading) return false;
    setLoading(true);
    const res = await prescriptionService.cancelReminder(prescriptionId);
    setLoading(false);
    if (res.success) {
      setReminderState(null);
      invalidatePrescriptions();
      return true;
    }
    Alert.alert("Reminder", "Failed to cancel reminder. Please try again.");
    return false;
  };

  return {
    isActive,
    frequencyDays: reminder?.frequencyDays ?? null,
    nextRemindDate,
    loading,
    setReminder,
    cancelReminder,
  };
}
