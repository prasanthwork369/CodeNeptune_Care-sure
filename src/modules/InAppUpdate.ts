import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo-modules-core";

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

// Optional: Android-only (see modules/in-app-update/expo-module.config.json),
// so it's absent on iOS/Expo Go — this returns null there instead of throwing.
// `addListener` is NOT guaranteed just because the module resolved: when the
// real JSI-installed module (globalThis.expo.modules.InAppUpdate, which
// extends expo-modules-core's EventEmitter) isn't ready yet at import time,
// requireOptionalNativeModule falls back to the legacy bridge proxy
// (NativeModulesProxy), a plain object that only carries the explicitly
// exported async functions and never inherits EventEmitter — so it has
// checkUpdateAvailability etc. but no addListener. Treat addListener as
// optional and probe for it explicitly instead of assuming it's always there.
const InAppUpdate = requireOptionalNativeModule<{
  checkUpdateAvailability: () => Promise<UpdateAvailability>;
  startFlexibleUpdate: () => Promise<UpdateFlowResult>;
  startImmediateUpdate: () => Promise<UpdateFlowResult>;
  completeFlexibleUpdate: () => Promise<boolean>;
  addListener?: (
    eventName: "InAppUpdate:state",
    listener: (event: InstallStateEvent) => void,
  ) => { remove: () => void };
}>("InAppUpdate");

const UNAVAILABLE: UpdateAvailability = {
  available: false,
  immediateInProgress: false,
  flexibleAllowed: false,
  immediateAllowed: false,
  installStatus: "unknown",
};

/**
 * True only on Android with the native module present *and* its listener API
 * usable. `checkUpdateAvailability` alone isn't enough: the legacy bridge
 * proxy fallback (see the comment above) exposes it too, but has no
 * `addListener`, so both are checked explicitly.
 */
export const isInAppUpdateSupported = (): boolean =>
  Platform.OS === "android" &&
  !!InAppUpdate?.checkUpdateAvailability &&
  typeof InAppUpdate?.addListener === "function";

export async function checkUpdateAvailability(): Promise<UpdateAvailability> {
  if (!isInAppUpdateSupported()) return UNAVAILABLE;
  try {
    return await InAppUpdate!.checkUpdateAvailability();
  } catch {
    return UNAVAILABLE;
  }
}

export async function startFlexibleUpdate(): Promise<UpdateFlowResult> {
  if (!isInAppUpdateSupported()) return "unavailable";
  try {
    return await InAppUpdate!.startFlexibleUpdate();
  } catch {
    return "failed";
  }
}

export async function startImmediateUpdate(): Promise<UpdateFlowResult> {
  if (!isInAppUpdateSupported()) return "unavailable";
  try {
    return await InAppUpdate!.startImmediateUpdate();
  } catch {
    return "failed";
  }
}

/** Installs a downloaded flexible update — this restarts the app. */
export async function completeFlexibleUpdate(): Promise<boolean> {
  if (!isInAppUpdateSupported()) return false;
  try {
    return await InAppUpdate!.completeFlexibleUpdate();
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
  if (!isInAppUpdateSupported() || !InAppUpdate?.addListener) return () => {};
  try {
    const sub = InAppUpdate.addListener("InAppUpdate:state", handler);
    return () => sub.remove();
  } catch {
    return () => {};
  }
}
