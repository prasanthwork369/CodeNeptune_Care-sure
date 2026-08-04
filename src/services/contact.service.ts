import { settingsApi, type Settings } from "@/src/api/settings.api";
import { logger } from "@/src/utils/logger";
import { Alert, Linking } from "react-native";

const WHATSAPP_MESSAGE =
  "Hi, I would like to place a medicine order via WhatsApp. Please assist me.";

const EMAIL_SUBJECT = "Help Request - CareSure App";

const UNAVAILABLE =
  "Support contact is unavailable right now. Please try again in a moment.";

async function openURL(url: string, fallbackMessage: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Unable to open", fallbackMessage);
  }
}

// Backend is the only source: screens pass their cached settings value, and callers
// outside React (notification actions) fall back to a fetch, never a bundled constant.
async function resolve(
  value: string | null | undefined,
  pick: (settings: Settings) => string | undefined,
): Promise<string | null> {
  if (value) return value;
  try {
    const settings = await settingsApi.getSettings();
    const resolved = pick(settings) || null;
    // Dev-only: tells apart "backend has no value" from "request failed".
    if (!resolved) logger.debug("[contact] settings missing field:", settings);
    return resolved;
  } catch (error) {
    logger.debug("[contact] settings fetch failed:", error);
    return null;
  }
}

/**
 * Plain functions, not a hook — notification handlers run outside React and
 * cannot call hooks. `useContactActions` wraps these for screens.
 */
export const contactService = {
  call: async (phone?: string | null) => {
    const finalPhone = await resolve(phone, (s) => s.contactPhone);
    if (!finalPhone) return Alert.alert("Unable to call", UNAVAILABLE);
    // Dialers choke on the spaces the admin panel allows, so strip to digits and +.
    return openURL(
      `tel:${finalPhone.replace(/[^\d+]/g, "")}`,
      `Please dial ${finalPhone} manually to place your order.`,
    );
  },

  whatsapp: async (whatsapp?: string | null) => {
    // WhatsApp shares the support line unless the admin sets a separate number.
    const finalWhatsapp = await resolve(
      whatsapp,
      (s) => s.whatsappNumber || s.contactPhone,
    );
    if (!finalWhatsapp) return Alert.alert("Unable to open", UNAVAILABLE);
    const clean = finalWhatsapp.replace(/\D/g, "");
    const url =
      clean.startsWith("91") || clean.length > 10
        ? `https://wa.me/${clean}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
        : `https://wa.me/91${clean}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    return openURL(
      url,
      "WhatsApp is not installed. Please install it or call us directly.",
    );
  },

  email: async (email?: string | null) => {
    const finalEmail = await resolve(email, (s) => s.contactEmail);
    if (!finalEmail) return Alert.alert("Unable to open", UNAVAILABLE);
    return openURL(
      `mailto:${finalEmail}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`,
      `Please email us at ${finalEmail} manually.`,
    );
  },
};
