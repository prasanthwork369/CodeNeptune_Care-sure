import { useEffect, useRef } from 'react';
import { locationService } from '@/src/services/location.service';
import { notificationService } from '@/src/services/notification.service';
import { useAuthStore } from '@/src/store/authStore';
import { useLocationStore } from '@/src/store/locationStore';
import { useUIStore } from '@/src/store/uiStore';
import { isExpoGo } from '@/src/utils/environment';

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

        (async () => {
            try {
                // ── Step 1: Location ────────────────────────────────────────
                // Skip entirely if the user already picked a delivery location.
                const { location, selectedAddressId } = useLocationStore.getState();
                if (!location && !selectedAddressId) {
                    // Await only the permission DIALOG — that's what must be
                    // sequential. The actual GPS fetch runs in the background so
                    // a slow lookup never delays the notification step or the
                    // popup; the header just fills in whenever it resolves.
                    const { granted } = await locationService.requestPermission();
                    if (granted) {
                        locationService
                            .getCurrentPlace()
                            .then((place) => {
                                if (!place?.city) return;
                                useLocationStore.getState().setLocation(
                                    {
                                        label: place.city,
                                        city: place.city,
                                        shortCity: place.city,
                                        pincode: place.pincode || undefined,
                                    },
                                    { coords: place.coords, pincode: place.pincode || undefined },
                                );
                            })
                            .catch(() => {});
                    }
                    // Note: if location is skipped/denied, the header still fills
                    // in for returning users — useHomeData syncs their default
                    // saved address into the location store once addresses load.
                }

                // ── Step 2: Notification ────────────────────────────────────
                // Awaits the dialog, so it only appears after location is done.
                if (!isExpoGo) {
                    await notificationService.promptAndRegister(
                        useAuthStore.getState().isAuthenticated,
                    );
                }
            } catch {
                // Permissions are best-effort — never block the home screen.
            } finally {
                // ── Step 3: Unlock the SignupBonusPopup ─────────────────────
                useUIStore.getState().setPermissionFlowComplete(true);
            }
        })();
    }, []);
};
