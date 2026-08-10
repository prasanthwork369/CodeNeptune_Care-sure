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
