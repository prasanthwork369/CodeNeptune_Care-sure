import { useCallback, useRef, useState } from "react";
import {
  requireInternet,
  runOnlineAction,
  type OnlineActionResult,
  type RunOnlineActionOptions,
} from "@/src/utils/offline";

/**
 * The standard way a screen runs an internet-dependent action.
 *
 *   const { run, pending } = useOnlineAction();
 *   const onSave = () => run(() => saveProfile(payload), { critical: true });
 *   <AppButton loading={pending} disabled={pending} onPress={onSave} />
 *
 * Guarantees, so no screen re-implements them:
 *  - offline → no loader, no request, no navigation; standard feedback only
 *  - a second tap while in flight is dropped (ref-based, so it holds within the
 *    same tick where a state flag would not)
 *  - failures are reported once, in the app-wide style, and never thrown
 */
export function useOnlineAction() {
  const [pending, setPending] = useState(false);
  const busyRef = useRef(false);

  const run = useCallback(
    async <T>(
      action: () => Promise<T>,
      opts: RunOnlineActionOptions = {},
    ): Promise<OnlineActionResult<T>> => {
      if (busyRef.current) return { ok: false, reason: "busy" };
      // Gate before the loader turns on: an offline tap must look inert, not busy.
      if (!requireInternet(opts)) return { ok: false, reason: "offline" };

      busyRef.current = true;
      setPending(true);
      try {
        return await runOnlineAction(action, { ...opts, preflight: false });
      } finally {
        busyRef.current = false;
        setPending(false);
      }
    },
    [],
  );

  return { run, pending };
}
