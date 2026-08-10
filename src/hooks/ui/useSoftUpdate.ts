import { useSettings } from "@/src/hooks/queries/useSettings";
import { isUpdateAvailable } from "@/src/utils/appVersion";
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

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(DISMISSED_KEY)
      .then((v) => active && setDismissed(v))
      .catch(() => active && setDismissed(null));
    return () => {
      active = false;
    };
  }, []);

  const latestVersion = data?.latestVersion;
  const available = isUpdateAvailable(latestVersion);

  const dismiss = useCallback(() => {
    // Optimistic: the prompt closes even if the write fails, so a storage
    // error cannot leave the user stuck with an undismissable modal.
    setDismissed(latestVersion ?? null);
    if (latestVersion) {
      AsyncStorage.setItem(DISMISSED_KEY, latestVersion).catch(() => {});
    }
  }, [latestVersion]);

  return {
    shouldPrompt:
      available && dismissed !== undefined && dismissed !== latestVersion,
    latestVersion,
    dismiss,
  };
}
