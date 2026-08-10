/**
 * Dev-only preview switches.
 *
 * The update gate is driven by backend settings, so on a normal build there is
 * no way to see its screens. Flip this to preview one, reload, and set it back
 * to null — no edits to the hooks themselves, so nothing can be committed by
 * accident in a state that blocks real users.
 *
 * Every read is behind `__DEV__`, so this cannot take effect in a release build
 * even if left set.
 */
export type DevGatePreview = "update" | "maintenance" | "soft" | null;

/**
 * Internal storage for the active preview. Mutable only via the dev APIs
 * below. Kept at module scope so tests and dev tooling can toggle it.
 */
let DEV_GATE_PREVIEW: DevGatePreview = null;

/**
 * Set the dev preview. Available in dev and test environments; a no-op
 * in production so callers don't need to remember to revert temporary
 * changes.
 */
export const setDevGatePreview: (which: DevGatePreview) => void = __DEV__
  ? (which: DevGatePreview) => {
      DEV_GATE_PREVIEW = which;
    }
  : (_: DevGatePreview) => {
      /* no-op in production */
    };

/** Clear the dev preview (dev only). */
export const clearDevGatePreview: () => void = __DEV__
  ? () => {
      DEV_GATE_PREVIEW = null;
    }
  : () => {
      /* no-op in production */
    };

/** Read the current preview (works everywhere). */
export const getDevGatePreview = (): DevGatePreview => DEV_GATE_PREVIEW;

/** True only when the preview is both requested and permitted. */
export const isGatePreview = (which: Exclude<DevGatePreview, null>): boolean =>
  __DEV__ && DEV_GATE_PREVIEW === which;

/**
 * "Update ready" banner preview.
 *
 * A finished flexible download only happens on a Play-installed build, so this
 * is the one piece of update UI that is otherwise impossible to look at during
 * development. Subscribable so the toggle takes effect without a reload.
 */
let DEV_UPDATE_READY = false;
const updateReadyListeners = new Set<() => void>();

export const setDevUpdateReady: (ready: boolean) => void = __DEV__
  ? (ready: boolean) => {
      DEV_UPDATE_READY = ready;
      updateReadyListeners.forEach((l) => l());
    }
  : (_: boolean) => {
      /* no-op in production */
    };

/** Always false outside dev, so consumers need no __DEV__ branch of their own. */
export const getDevUpdateReady = (): boolean => __DEV__ && DEV_UPDATE_READY;

export const subscribeDevUpdateReady = (listener: () => void): (() => void) => {
  updateReadyListeners.add(listener);
  return () => {
    updateReadyListeners.delete(listener);
  };
};
