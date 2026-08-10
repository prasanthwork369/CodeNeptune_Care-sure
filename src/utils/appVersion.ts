import * as Application from "expo-application";

/**
 * Compares dotted numeric versions ("1.4.0"). Returns -1, 0 or 1.
 * Missing segments count as 0, so "1.4" and "1.4.0" are equal.
 */
export const compareVersions = (a: string, b: string): number => {
  const pa = a.split(".");
  const pb = b.split(".");
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = parseInt(pa[i] ?? "0", 10);
    const nb = parseInt(pb[i] ?? "0", 10);
    if (Number.isNaN(na) || Number.isNaN(nb)) return 0; // Unparseable → treat as equal.
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
};

export const currentAppVersion = (): string | null =>
  Application.nativeApplicationVersion;

/**
 * True only when we can prove the installed build is older than the required
 * one. Every uncertain case — no setting, unreadable version, unparseable
 * string — returns false, because wrongly locking a user out of a pharmacy app
 * is far worse than letting an old build keep running.
 */
export const isUpdateRequired = (
  minSupportedVersion: string | undefined,
  installed: string | null = currentAppVersion(),
): boolean => {
  if (!minSupportedVersion || !installed) return false;
  if (!/^\d+(\.\d+)*$/.test(minSupportedVersion)) return false;
  if (!/^\d+(\.\d+)*$/.test(installed)) return false;
  return compareVersions(installed, minSupportedVersion) < 0;
};
