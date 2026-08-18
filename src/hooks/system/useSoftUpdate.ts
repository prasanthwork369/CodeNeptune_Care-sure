import { useSettings } from "@/src/hooks/queries/useSettings";
import { isUpdateAvailable } from "@/src/utils/appVersion";
import { getDevGatePreview } from "@/src/utils/devFlags";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const DISMISSED_KEY = "@caresure:soft_update_dismissed_version";

/**
 * The optional "a new version is available" prompt.
 *
 * Dismissal is remembered per version, not forever: skipping 1.4.0 silences
 * 1.4.0 only, and the next release asks once more. A prompt that returns every
 * launch trains users to dismiss it without reading, which is worse than not
 * asking at all.
 */
export function useSoftUpdate() {
  const { data } = useSettings();
  // undefined = storage not read yet. Distinct from null (nothing dismissed),
  // so the prompt cannot flash before we know whether it was already skipped.
  const [dismissed, setDismissed] = useState<string | null | undefined>(
    undefined,
  );

  const devPreview = __DEV__ ? getDevGatePreview() : null;
  const latestVersion =
    data?.latestVersion ?? (devPreview === "soft" ? "999.0.0" : undefined);
  const available = isUpdateAvailable(latestVersion);

  // Re-read the dismissed storage value whenever the candidate latestVersion
  // changes. This ensures forcing the same latestVersion after clearing the
  // dismissed key makes the prompt reappear without a reload.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(DISMISSED_KEY)
      .then((v) => active && setDismissed(v))
      .catch(() => active && setDismissed(null));
    return () => {
      active = false;
    };
  }, [latestVersion]);

  const dismiss = useCallback(() => {
    // Optimistic: the prompt closes even if the write fails, so a storage
    // error cannot leave the user stuck with an undismissable modal.
    setDismissed(latestVersion ?? null);
    if (latestVersion) {
      AsyncStorage.setItem(DISMISSED_KEY, latestVersion).catch(() => {});
    }
  }, [latestVersion]);

  return {
    /** Drives the one-time popup — goes false once this version is dismissed. */
    shouldPrompt:
      available && dismissed !== undefined && dismissed !== latestVersion,
    /**
     * Raw availability, ignoring dismissal. The Profile row uses this so that
     * declining the popup leaves a permanent way back to updating, rather than
     * hiding the option until the next release.
     */
    available,
    latestVersion,
    dismiss,
  };
}
