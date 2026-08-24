import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Linking, Platform } from "react-native";
import { armSettingsReturn } from "@/src/store/lastRouteStore";

/** A device location reverse-geocoded into address fields the app uses. */
export interface ParsedPlace {
  coords: { latitude: number; longitude: number };
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

/** Just the device coordinates, for callers that resolve the address server side. */
export interface DeviceCoords {
  latitude: number;
  longitude: number;
}

/** Why a location read failed, so callers can pick the right recovery UX. */
export interface LocationFailure {
  code: string;
  message: string;
  raw?: unknown;
}

/** Legacy expo-location probes missing from the current typings. */
type LegacyLocationApi = {
  getProviderStatusAsync?: () => Promise<unknown>;
  hasServicesEnabledAsync?: () => Promise<boolean>;
};

/** Reads `message` off an unknown thrown value without asserting its shape. */
const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err ?? "");

/** Below this, the OS resolved without a human ever seeing the dialog. */
const DIALOG_MIN_MS = 250;

// Key bumped so installs whose flag was set without a dialog get one clean prompt.
const ASKED_KEY = "@caresure:location_permission_asked_v2";

// Records "asked" only when a dialog really showed; some ROMs auto-deny instantly.
const requestAndRecord = async () => {
  const startedAt = Date.now();
  const req = await Location.requestForegroundPermissionsAsync();
  const answered =
    req.status === "granted" || Date.now() - startedAt >= DIALOG_MIN_MS;
  if (answered) {
    try {
      await AsyncStorage.setItem(ASKED_KEY, "1");
    } catch {}
  }
  return req;
};

/**
 * Whether the provider status *definitively* says location services are off.
 *
 * We deliberately trust `locationServicesEnabled === true` when it's present:
 * right after the user toggles GPS on, `gpsAvailable` and `networkAvailable`
 * can both still read false for a moment (providers haven't initialised a fix
 * yet). The old check treated that as "disabled" and fired a false "Enable GPS"
 * prompt even though GPS was on. The gps/network both-off heuristic is only
 * used as a fallback when the explicit flag isn't reporting "on".
 */
const isServicesDisabled = (status: unknown): boolean => {
  // `hasServicesEnabledAsync()` fallback returns a plain boolean.
  if (typeof status === "boolean") return status === false;
  if (!status || typeof status !== "object") return false;
  const s = status as {
    locationServicesEnabled?: boolean;
    gpsAvailable?: boolean;
    networkAvailable?: boolean;
  };
  if (s.locationServicesEnabled === false) return true;
  if (s.locationServicesEnabled === true) return false;
  return s.gpsAvailable === false && s.networkAvailable === false;
};

/** Probes provider state, falling back to the boolean API when the rich one is missing. */
const readProviderStatus = async (): Promise<unknown> => {
  const legacyLocation = Location as unknown as LegacyLocationApi;
  try {
    return await legacyLocation.getProviderStatusAsync?.();
  } catch (e) {
    if (__DEV__)
      console.debug("locationService: getProviderStatusAsync failed", e);
    try {
      return await legacyLocation.hasServicesEnabledAsync?.();
    } catch (ee) {
      if (__DEV__)
        console.debug("locationService: hasServicesEnabledAsync failed", ee);
      return null;
    }
  }
};

/**
 * Maps a thrown location error to SERVICES_DISABLED or a generic failure.
 *
 * Only errors that clearly say the provider/services are off count as
 * SERVICES_DISABLED — generic timeouts and "denied" messages previously
 * produced false "Enable GPS" prompts even when GPS was on.
 */
const classifyFailure = (
  err: unknown,
  providerStatus: unknown,
): LocationFailure => {
  const msg = errorMessage(err).toLowerCase();
  const servicesDisabled =
    isServicesDisabled(providerStatus) ||
    /location.*(disabled|not enabled|turned off)|services?.*(disabled|off|not enabled)|no location provider|provider.*(disabled|not available)/.test(
      msg,
    );
  return {
    code: servicesDisabled ? "SERVICES_DISABLED" : "LOCATION_ERROR",
    message: errorMessage(err),
    raw: err,
  };
};

/** With GPS on but no fix (indoors / weak signal) the read can hang forever. */
const POSITION_TIMEOUT_MS = 12000;

/**
 * Reads a device position, or explains why it couldn't.
 *
 * When the provider explicitly reports services off we skip
 * `getCurrentPositionAsync` — on some Android OEMs that call triggers a system
 * 'Enable location' dialog, which would duplicate the app's own prompt.
 */
const getPosition = async (): Promise<{
  position: Location.LocationObject | null;
  providerStatus: unknown;
  error?: LocationFailure;
}> => {
  const providerStatus = await readProviderStatus();

  if (isServicesDisabled(providerStatus)) {
    return {
      position: null,
      providerStatus,
      error: {
        code: "SERVICES_DISABLED",
        message: "Provider reports location services disabled",
        raw: providerStatus,
      },
    };
  }

  try {
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
    } catch (raceErr) {
      // On timeout fall back to the last known fix so the user isn't left spinning.
      if (errorMessage(raceErr) !== "LOCATION_TIMEOUT") throw raceErr;
      const last = await Location.getLastKnownPositionAsync();
      if (!last) throw raceErr;
      position = last;
    }
    return { position, providerStatus };
  } catch (err) {
    if (__DEV__)
      console.debug("locationService: getCurrentPositionAsync failed", err);
    return {
      position: null,
      providerStatus,
      error: classifyFailure(err, providerStatus),
    };
  }
};

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
        askedBefore = (await AsyncStorage.getItem(ASKED_KEY)) === "1";
      } catch {}
      if (!existing.canAskAgain || askedBefore) {
        return {
          granted: false,
          canAskAgain: existing.canAskAgain,
          askedBefore,
        };
      }
      const req = await requestAndRecord();
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
    const req = await requestAndRecord();
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
    error?: LocationFailure;
    providerStatus?: unknown;
  }> => {
    const { position, providerStatus, error } = await getPosition();
    if (!position) return { place: null, providerStatus, error };

    try {
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
    } catch (err) {
      if (__DEV__) console.debug("locationService: reverseGeocode failed", err);
      return {
        place: null,
        providerStatus,
        error: classifyFailure(err, providerStatus),
      };
    }
  },

  /**
   * Coordinates only, for callers that resolve the address on the backend
   * (`locationApi.resolveCoords`) instead of reverse-geocoding on device.
   * Inspect `error.code === 'SERVICES_DISABLED'` to show an "Enable GPS" flow.
   */
  getCurrentCoords: async (): Promise<{
    coords: DeviceCoords | null;
    error?: LocationFailure;
  }> => {
    const { position, error } = await getPosition();
    if (!position) return { coords: null, error };
    return {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  },

  /** Opens device location settings (tries Android Location settings first). */
  openLocationSettings: async (): Promise<void> => {
    armSettingsReturn();
    try {
      if (Platform.OS === "android" && Linking.sendIntent) {
        try {
          await Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
          return;
        } catch {}
      }
    } catch {}
    try {
      await Linking.openSettings();
    } catch {}
  },
};
