import { prescriptionCallbackApi } from "../api/prescription-callback.api";
import { useAuthStore } from "@/src/store/authStore";
import { logger } from "@/src/utils/logger";

/** Server requires name >= 2 and phone >= 10; fall back rather than 400. */
const FALLBACK_NAME = "Customer";

function buildName(firstName?: string, lastName?: string): string {
  const full = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return full.length >= 2 ? full : FALLBACK_NAME;
}

/**
 * Queues a pharmacist call-back so the request reaches the staff dashboards
 * (admin / doctor-caller / pharmacist), which is what the website's
 * "Ask Pharmacist" modal does.
 *
 * Fire-and-forget by design: this runs alongside the Call-Us checkout path and
 * must never block or fail it. Returns whether the request was queued.
 */
export async function requestPharmacistCallback(
  notes?: string,
): Promise<boolean> {
  const user = useAuthStore.getState().user;
  const phone = (user?.phoneNumber ?? "").trim();

  // Without a usable phone there is nothing for a pharmacist to call.
  if (phone.length < 10) {
    if (__DEV__) {
      logger.debug("[Callback] Skipped — no usable phone on the profile");
    }
    return false;
  }

  try {
    await prescriptionCallbackApi.create({
      customerInfo: {
        id: user?.id ?? null,
        name: buildName(user?.firstName, user?.lastName),
        phone,
        email: user?.email?.trim() || null,
      },
      notes: notes?.slice(0, 1000),
    });
    return true;
  } catch (err) {
    if (__DEV__) {
      logger.debug("[Callback] Request failed, checkout continues:", err);
    }
    return false;
  }
}
