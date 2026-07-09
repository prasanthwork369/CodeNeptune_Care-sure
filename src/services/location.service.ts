import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Linking, Platform } from "react-native";

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
  /**
   * Asks for foreground location permission.
   * By default the call is non-interactive (won't show the system dialog)
   * if the app has already requested permission before. Pass
   * `{ interactive: true }` when the user explicitly triggers a location
   * action (e.g. taps "Use Current Location") so the dialog may appear.
   */
  requestPermission: async (opts?: {
    interactive?: boolean;
  }): Promise<{
    granted: boolean;
    canAskAgain: boolean;
    askedBefore: boolean;
  }> => {
    const existing = await Location.getForegroundPermissionsAsync();
    if (existing.status === "granted")
      return {
        granted: true,
        canAskAgain: existing.canAskAgain,
        askedBefore: true,
      };

    // If OS doesn't allow re-asking, bail out quickly.
    if (!existing.canAskAgain)
      return { granted: false, canAskAgain: false, askedBefore: true };

    // Check whether we've already prompted before. If so and the caller
    // didn't ask to be interactive, avoid showing the system dialog again.
    try {
      const asked = await AsyncStorage.getItem(
        "@caresure:location_permission_asked",
      );
      const askedBefore = asked === "1";
      if (askedBefore && !opts?.interactive) {
        return {
          granted: false,
          canAskAgain: existing.canAskAgain,
          askedBefore: true,
        };
      }

      // Caller either requested interactive prompt or we never asked before.
      const req = await Location.requestForegroundPermissionsAsync();
      // Persist that we've shown the permission prompt at least once so
      // we don't repeatedly show it on subsequent app launches.
      try {
        await AsyncStorage.setItem("@caresure:location_permission_asked", "1");
      } catch {}

      return {
        granted: req.status === "granted",
        canAskAgain: req.canAskAgain,
        askedBefore: askedBefore,
      };
    } catch (e) {
      // In case storage fails, still try to request permission interactively.
      const req = await Location.requestForegroundPermissionsAsync();
      return {
        granted: req.status === "granted",
        canAskAgain: req.canAskAgain,
        askedBefore: false,
      };
    }
  },

  /**
   * Gets the current position and reverse-geocodes it into address fields.
   * Returns an object with `place` when successful, or `place: null` and an
   * `error` object describing why it failed. Callers should inspect
   * `error.code === 'SERVICES_DISABLED'` to decide whether to show an
   * "Enable GPS" flow.
   */
  getCurrentPlace: async (): Promise<{
    place: ParsedPlace | null;
    error?: { code: string; message: string; raw?: any };
    providerStatus?: any;
  }> => {
    let providerStatus: any = null;
    try {
      providerStatus = await (Location as any).getProviderStatusAsync?.();
      console.debug("locationService: providerStatus", providerStatus);
    } catch (e) {
      console.debug("locationService: getProviderStatusAsync failed", e);
      try {
        providerStatus = await (Location as any).hasServicesEnabledAsync?.();
        console.debug(
          "locationService: hasServicesEnabledAsync",
          providerStatus,
        );
      } catch (ee) {
        console.debug("locationService: hasServicesEnabledAsync failed", ee);
      }
    }

    // If providerStatus explicitly reports services are disabled, avoid
    // calling `getCurrentPositionAsync` — on some Android OEMs that call
    // triggers a system 'Enable location' dialog. In that case return a
    // SERVICES_DISABLED error so callers can show a single, controlled
    // in-app message instead of producing duplicate system+app prompts.
    const servicesDisabledFromProvider =
      providerStatus &&
      (providerStatus.locationServicesEnabled === false ||
        (providerStatus.gpsAvailable === false &&
          providerStatus.networkAvailable === false));

    if (servicesDisabledFromProvider) {
      console.debug(
        "locationService: provider indicates services disabled — skipping position read",
      );
      return {
        place: null,
        providerStatus,
        error: {
          code: "SERVICES_DISABLED",
          message: "Provider reports location services disabled",
          raw: providerStatus,
        },
      };
    }

    // Provider didn't explicitly indicate disabled; attempt to read a
    // position. This may trigger OS dialogs on some devices only when the
    // provider is actually disabled — we handled that above.
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      console.debug(
        "locationService: getCurrentPositionAsync success",
        position?.coords,
      );

      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      if (!place) return { place: null };

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
        place: {
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          line1,
          line2,
          city,
          state,
          pincode,
        },
        providerStatus,
      };
    } catch (err: any) {
      // Log the raw error for debugging.
      console.debug("locationService: getCurrentPositionAsync failed", err);

      // Heuristic: treat as services-disabled when providerStatus indicates
      // services are off, or when the thrown error message mentions
      // 'disabled', 'services', 'provider', or 'gps'. This covers several
      // Android OEM/Play-services error messages.
      const msg = String(err?.message ?? err ?? "").toLowerCase();
      const servicesDisabledFromProvider =
        providerStatus &&
        (providerStatus.locationServicesEnabled === false ||
          (providerStatus.gpsAvailable === false &&
            providerStatus.networkAvailable === false));
      const servicesDisabledFromError =
        /disabled|service|services|provider|gps|no provider/.test(msg) &&
        /disabled|off|not available|no provider|denied/.test(msg);

      if (servicesDisabledFromProvider || servicesDisabledFromError) {
        return {
          place: null,
          providerStatus,
          error: {
            code: "SERVICES_DISABLED",
            message: String(err?.message ?? err),
            raw: err,
          },
        };
      }

      // Otherwise return a general failure detail so callers may decide how
      // to present errors (e.g. generic "Could not fetch location").
      return {
        place: null,
        providerStatus,
        error: {
          code: "LOCATION_ERROR",
          message: String(err?.message ?? err),
          raw: err,
        },
      };
    }
  },

  /** Opens device location settings (tries Android Location settings first). */
  openLocationSettings: async (): Promise<void> => {
    try {
      if (Platform.OS === "android" && (Linking as any).sendIntent) {
        try {
          await (Linking as any).sendIntent(
            "android.settings.LOCATION_SOURCE_SETTINGS",
          );
          return;
        } catch {}
      }
    } catch {}
    try {
      await Linking.openSettings();
    } catch {}
  },
};
