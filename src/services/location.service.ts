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

    // Non-interactive (silent auto-detect on home load): don't nag. Respect the
    // cached state and the "asked before" flag so the user is never surprised
    // by a dialog they didn't trigger.
    if (!opts?.interactive) {
      let askedBefore = false;
      try {
        askedBefore =
          (await AsyncStorage.getItem(
            "@caresure:location_permission_asked",
          )) === "1";
      } catch {}
      if (!existing.canAskAgain || askedBefore) {
        return {
          granted: false,
          canAskAgain: existing.canAskAgain,
          askedBefore,
        };
      }
      const req = await Location.requestForegroundPermissionsAsync();
      try {
        await AsyncStorage.setItem("@caresure:location_permission_asked", "1");
      } catch {}
      return {
        granted: req.status === "granted",
        canAskAgain: req.canAskAgain,
        askedBefore: false,
      };
    }

    // Interactive (user tapped "Use Current Location"): ALWAYS attempt the OS
    // request. On "ask every time" / one-time-permission devices (e.g. Vivo)
    // the cached `canAskAgain` can read false even though the OS will still
    // show the dialog — so we must not pre-empt with a Settings redirect.
    // Let the OS decide: it shows the dialog when allowed, or resolves denied
    // immediately when permanently denied. We then react to THIS fresh result,
    // which is how mainstream apps re-prompt instead of jumping to Settings.
    const req = await Location.requestForegroundPermissionsAsync();
    try {
      await AsyncStorage.setItem("@caresure:location_permission_asked", "1");
    } catch {}
    return {
      granted: req.status === "granted",
      canAskAgain: req.canAskAgain,
      askedBefore: true,
    };
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
    } catch (e) {
      if (__DEV__)
        console.debug("locationService: getProviderStatusAsync failed", e);
      try {
        providerStatus = await (Location as any).hasServicesEnabledAsync?.();
      } catch (ee) {
        if (__DEV__)
          console.debug("locationService: hasServicesEnabledAsync failed", ee);
      }
    }

    // Whether the provider status *definitively* says location services are
    // off. We deliberately trust `locationServicesEnabled === true` when it's
    // present: right after the user toggles GPS on, `gpsAvailable` and
    // `networkAvailable` can both still read false for a moment (providers
    // haven't initialised a fix yet). The old check treated that as
    // "disabled" and fired a false "Enable GPS" prompt even though GPS was on.
    // The gps/network both-off heuristic is only used as a fallback when the
    // explicit flag isn't reporting "on".
    const isServicesDisabled = (status: any): boolean => {
      // `hasServicesEnabledAsync()` fallback returns a plain boolean.
      if (typeof status === "boolean") return status === false;
      if (!status || typeof status !== "object") return false;
      if (status.locationServicesEnabled === false) return true;
      if (status.locationServicesEnabled === true) return false;
      return status.gpsAvailable === false && status.networkAvailable === false;
    };

    // If providerStatus explicitly reports services are disabled, avoid
    // calling `getCurrentPositionAsync` — on some Android OEMs that call
    // triggers a system 'Enable location' dialog. In that case return a
    // SERVICES_DISABLED error so callers can show a single, controlled
    // in-app message instead of producing duplicate system+app prompts.
    const servicesDisabledFromProvider = isServicesDisabled(providerStatus);

    if (servicesDisabledFromProvider) {
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
      // Race the read against a timeout: with GPS on but no fix (indoors /
      // weak signal) getCurrentPositionAsync can hang indefinitely, leaving
      // the "Fetching" spinner stuck. On timeout, fall back to the last known
      // position so the user still gets a usable location instead of a freeze.
      const POSITION_TIMEOUT_MS = 12000;
      let position: Location.LocationObject;
      try {
        position = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("LOCATION_TIMEOUT")),
              POSITION_TIMEOUT_MS,
            ),
          ),
        ]);
      } catch (raceErr: any) {
        if (raceErr?.message === "LOCATION_TIMEOUT") {
          const last = await Location.getLastKnownPositionAsync();
          if (!last) throw raceErr;
          position = last;
        } else {
          throw raceErr;
        }
      }

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
      if (__DEV__)
        console.debug("locationService: getCurrentPositionAsync failed", err);

      // Heuristic: treat as services-disabled when providerStatus indicates
      // services are off, or when the thrown error message mentions
      // 'disabled', 'services', 'provider', or 'gps'. This covers several
      // Android OEM/Play-services error messages.
      const msg = String(err?.message ?? err ?? "").toLowerCase();
      // Reuse the same conservative check as the pre-read path so a momentary
      // gps/network "unavailable" right after enabling GPS isn't mistaken for
      // "services off" when locationServicesEnabled is already true.
      const servicesDisabledFromProvider = isServicesDisabled(providerStatus);
      // Only treat the thrown error as "services disabled" when it clearly
      // says the location provider/services are off — not for generic
      // timeouts or "denied" messages, which previously produced false
      // "Enable GPS" prompts even when GPS was on.
      const servicesDisabledFromError =
        /location.*(disabled|not enabled|turned off)|services?.*(disabled|off|not enabled)|no location provider|provider.*(disabled|not available)/.test(
          msg,
        );

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
