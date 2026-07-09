import { locationService } from "@/src/services/location.service";
import { notificationService } from "@/src/services/notification.service";
import { useLocationStore } from "@/src/store/locationStore";
import { useUIStore } from "@/src/store/uiStore";
import { isExpoGo } from "@/src/utils/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";

/**
 * Runs the Home onboarding permission flow strictly in order, one dialog at a
 * time, then unlocks the SignupBonusPopup:
 *
 *   1. Location   — prompt (if not already granted) and fill the header.
 *   2. Notification — prompt (if not already granted) and register the token.
 *   3. Mark `permissionFlowComplete` so the SignupBonusPopup may show.
 *
 * Each `requestPermission()` resolves only after the user answers its dialog,
 * so awaiting them sequences the prompts — no overlap, no race. Already-granted
 * steps resolve instantly (no dialog), so they're effectively skipped. Runs once.
 */
export const useHomeOnboarding = () => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Close the gate up front so a stale `true` from a previous session
    // (the flag isn't reset on logout) can't show the popup before this
    // session's flow finishes.
    useUIStore.getState().setPermissionFlowComplete(false);

    let isFetching = false;

    (async () => {
      try {
        // Load last saved location quickly so header can render immediately.
        try {
          const saved = await AsyncStorage.getItem(
            "@caresure:last_known_location",
          );
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.location) {
              useLocationStore.getState().setLocation(parsed.location, {
                coords: parsed.coords ?? undefined,
                pincode: parsed.pincode ?? undefined,
              });
            }
          }
        } catch {}

        // ── Step 1: Location ────────────────────────────────────────
        // Skip entirely if the user already picked a delivery location.
        const { location, selectedAddressId } = useLocationStore.getState();
        if (!location && !selectedAddressId) {
          // Non-interactive permission check: don't show the dialog if we've
          // asked before. If permission is granted, fetch the place in the
          // background and persist it as the last-known location.
          const { granted } = await locationService.requestPermission();
          if (granted) {
            if (isFetching) return;
            isFetching = true;
            try {
              const result = await locationService.getCurrentPlace();
              console.debug(
                "useHomeOnboarding: getCurrentPlace result",
                result,
              );
              const place = result.place;
              // If we got a place, persist and set it.
              if (place?.city) {
                const loc = {
                  label: place.city,
                  city: place.city,
                  shortCity: place.city,
                  pincode: place.pincode || undefined,
                };
                const current = useLocationStore.getState().location;
                const same =
                  current &&
                  current.city === loc.city &&
                  (current.pincode ?? "") === (loc.pincode ?? "");
                if (!same) {
                  useLocationStore.getState().setLocation(loc, {
                    coords: place.coords,
                    pincode: place.pincode || undefined,
                  });
                  try {
                    await AsyncStorage.setItem(
                      "@caresure:last_known_location",
                      JSON.stringify({
                        location: loc,
                        coords: place.coords,
                        pincode: place.pincode,
                      }),
                    );
                  } catch {}
                }
                // Clear any previous "Not Now" choice since GPS is now available.
                try {
                  await AsyncStorage.removeItem("@caresure:gps_prompt_not_now");
                } catch {}
              } else {
                // GPS / location services likely disabled. Show a one-time
                // non-intrusive prompt offering Enable GPS / Not Now. We only
                // show this when the failure is services-disabled.
                try {
                  const dismissed =
                    (await AsyncStorage.getItem(
                      "@caresure:gps_prompt_not_now",
                    )) === "1";
                  const shown =
                    (await AsyncStorage.getItem(
                      "@caresure:gps_auto_prompt_shown",
                    )) === "1";
                  if (
                    !dismissed &&
                    !shown &&
                    result.error?.code === "SERVICES_DISABLED"
                  ) {
                    // Mark we've auto-shown this prompt once so it won't show again.
                    try {
                      await AsyncStorage.setItem(
                        "@caresure:gps_auto_prompt_shown",
                        "1",
                      );
                    } catch {}
                    Alert.alert(
                      "Enable Location Services",
                      "Location services are turned off. Enable GPS to auto-detect your address.",
                      [
                        {
                          text: "Not Now",
                          style: "cancel",
                          onPress: async () => {
                            try {
                              await AsyncStorage.setItem(
                                "@caresure:gps_prompt_not_now",
                                "1",
                              );
                            } catch {}
                          },
                        },
                        {
                          text: "Enable GPS",
                          onPress: async () => {
                            try {
                              await locationService.openLocationSettings();
                            } catch {}
                          },
                        },
                      ],
                    );
                  }
                } catch {}
              }
            } finally {
              isFetching = false;
            }
          }
          // Note: if location is skipped/denied, the header still fills
          // in for returning users — useHomeData syncs their default
          // saved address into the location store once addresses load.
        }

        // ── Step 2: Notification ────────────────────────────────────
        // Awaits the dialog, so it only appears after location is done.
        if (!isExpoGo) {
          await notificationService.promptAndRegister();
        }
      } catch {
        // Permissions are best-effort — never block the home screen.
      } finally {
        // ── Step 3: Unlock the SignupBonusPopup ─────────────────────
        useUIStore.getState().setPermissionFlowComplete(true);
      }
    })();

    // Listen for app resume to silently refresh location if permissions
    // are granted and GPS was enabled while the user was in Settings.
    const skipInitialActive = { current: true } as { current: boolean };
    const sub = AppState.addEventListener("change", async (next) => {
      if (next !== "active") return;
      if (skipInitialActive.current) {
        skipInitialActive.current = false;
        return;
      }
      try {
        const existing = await Location.getForegroundPermissionsAsync();
        if (existing.status !== "granted") return;
        // Permission granted; try to silently fetch current place.
        if (isFetching) return;
        isFetching = true;
        try {
          const res = await locationService.getCurrentPlace();
          console.debug("useHomeOnboarding (resume): getCurrentPlace", res);
          const place = res.place;
          if (!place?.city) return;
          const loc = {
            label: place.city,
            city: place.city,
            shortCity: place.city,
            pincode: place.pincode || undefined,
          };
          const current = useLocationStore.getState().location;
          const same =
            current &&
            current.city === loc.city &&
            (current.pincode ?? "") === (loc.pincode ?? "");
          if (!same) {
            useLocationStore.getState().setLocation(loc, {
              coords: place.coords,
              pincode: place.pincode || undefined,
            });
            try {
              await AsyncStorage.setItem(
                "@caresure:last_known_location",
                JSON.stringify({
                  location: loc,
                  coords: place.coords,
                  pincode: place.pincode,
                }),
              );
            } catch {}
          }
          try {
            await AsyncStorage.removeItem("@caresure:gps_prompt_not_now");
          } catch {}
        } finally {
          isFetching = false;
        }
      } catch {}
    });

    return () => {
      try {
        sub.remove();
      } catch {}
    };
  }, []);
};
