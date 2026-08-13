import { NativeEventEmitter, NativeModules, Platform } from "react-native";

const { InAppUpdate } = NativeModules;

/** Outcome of asking Play to start an update flow. */
export type UpdateFlowResult =
  "accepted" | "cancelled" | "failed" | "unavailable" | "in_progress";

export type InstallStatus =
  | "pending"
  | "downloading"
  | "downloaded"
  | "installing"
  | "installed"
  | "failed"
  | "cancelled"
  | "unknown";

export interface UpdateAvailability {
  available: boolean;
  /** Play is already mid-way through an immediate update it started earlier. */
  immediateInProgress: boolean;
  flexibleAllowed: boolean;
  immediateAllowed: boolean;
  installStatus: InstallStatus;
  stalenessDays?: number;
  availableVersionCode?: number;
}

export interface InstallStateEvent {
  status: InstallStatus;
  bytesDownloaded: number;
  totalBytes: number;
}

const UNAVAILABLE: UpdateAvailability = {
  available: false,
  immediateInProgress: false,
  flexibleAllowed: false,
  immediateAllowed: false,
  installStatus: "unknown",
};

/**
 * True only on Android with the native module present. iOS and any build
 * without the module fall straight through to the store link.
 */
export const isInAppUpdateSupported = (): boolean =>
  Platform.OS === "android" && !!InAppUpdate?.checkUpdateAvailability;

export async function checkUpdateAvailability(): Promise<UpdateAvailability> {
  if (!isInAppUpdateSupported()) return UNAVAILABLE;
  try {
    return await InAppUpdate.checkUpdateAvailability();
  } catch {
    return UNAVAILABLE;
  }
}

export async function startFlexibleUpdate(): Promise<UpdateFlowResult> {
  if (!isInAppUpdateSupported()) return "unavailable";
  try {
    return await InAppUpdate.startFlexibleUpdate();
  } catch {
    return "failed";
  }
}

export async function startImmediateUpdate(): Promise<UpdateFlowResult> {
  if (!isInAppUpdateSupported()) return "unavailable";
  try {
    return await InAppUpdate.startImmediateUpdate();
  } catch {
    return "failed";
  }
}

/** Installs a downloaded flexible update — this restarts the app. */
export async function completeFlexibleUpdate(): Promise<boolean> {
  if (!isInAppUpdateSupported()) return false;
  try {
    return await InAppUpdate.completeFlexibleUpdate();
  } catch {
    return false;
  }
}

/**
 * Subscribes to download/install progress. Returns a no-op unsubscribe when
 * unsupported, so callers need no platform branch in their cleanup.
 */
export function addInstallStateListener(
  handler: (event: InstallStateEvent) => void,
): () => void {
  if (!isInAppUpdateSupported()) return () => {};
  const emitter = new NativeEventEmitter(InAppUpdate);
  const sub = emitter.addListener("InAppUpdate:state", handler);
  return () => sub.remove();
}
