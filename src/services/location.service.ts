import * as Location from "expo-location";

/** A device location reverse-geocoded into address fields the app uses. */
export interface ParsedPlace {
  coords: { latitude: number; longitude: number };
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

/**
 * Shared device-location helpers, reused by both the auto-detect on home load
 * (useHomeOnboarding) and the "Use Current Location" button (LocationBottomSheet).
 * Callers decide their own permission-denied UX (silent vs alert).
 */
export const locationService = {
  /** Asks for foreground location permission only if the OS still allows it. */
  requestPermission: async (): Promise<{
    granted: boolean;
    canAskAgain: boolean;
  }> => {
    const existing = await Location.getForegroundPermissionsAsync();
    if (existing.status === "granted")
      return { granted: true, canAskAgain: existing.canAskAgain };
    if (!existing.canAskAgain) return { granted: false, canAskAgain: false };
    const req = await Location.requestForegroundPermissionsAsync();
    return { granted: req.status === "granted", canAskAgain: req.canAskAgain };
  },

  /** Gets the current position and reverse-geocodes it into address fields. */
  getCurrentPlace: async (): Promise<ParsedPlace | null> => {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const [place] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    if (!place) return null;

    const numberMatch = place.name?.match(/^(\d+)/);
    const line1 = numberMatch ? numberMatch[1] : "";
    const buildingName = place.name?.replace(/^\d+[,\s]*/, "").trim() || "";
    const line2 = [
      buildingName,
      place.street,
      place.district ?? place.subregion,
    ]
      .filter(Boolean)
      .join(", ");
    const city = place.city || place.subregion || place.region || "";
    const state = place.region || "";
    const pincode = place.postalCode
      ? place.postalCode.replace(/\D/g, "").slice(0, 6)
      : "";

    return {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      line1,
      line2,
      city,
      state,
      pincode,
    };
  },
};
