/**
 * Debug logging that never reaches release builds.
 *
 * Metro replaces `__DEV__` with a literal at build time, so the whole call is
 * dead code in production — no string formatting, no JSON.stringify, and no
 * diagnostics leaking into device logs.
 */
export const logger = {
  debug: (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) console.warn(...args);
  },
  // Errors stay in release builds — Crashlytics reporting is wired separately.
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
