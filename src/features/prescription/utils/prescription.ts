import { File, Paths } from "expo-file-system";
import {
  ApiPrescription,
  PrescriptionItem,
} from "@/src/features/prescription/types";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { CapturedAsset } from "../scanner";
import { logger } from "@/src/utils/logger";

/**
 * Prefers `imageUrls`; falls back to `fileData[].url` for API responses that
 * only send `fileData` (the two shapes GET /prescriptions has returned).
 */
export function getPrescriptionImageUrls(item: ApiPrescription): string[] {
  if (item.imageUrls?.length) return item.imageUrls;
  return (item.fileData ?? [])
    .map((f) => f.url)
    .filter((url): url is string => !!url);
}

/**
 * Last-resort fallbacks, NOT the real limits.
 *
 * The admin owns these values and they arrive from
 * `/settings/public/customer/upload` via `useUploadConfig()`, which caches them
 * in SQLite. So these apply only on a first-ever launch that has never reached
 * the API — after one successful fetch the cached values win, even offline.
 *
 * They are deliberately *under* the real limits: guessing low makes the app
 * reject a file the server would have taken (user retries smaller), while
 * guessing high would accept a file the server rejects, wasting a full upload
 * before failing. Rejecting early is the kinder failure.
 */
export const MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const PRESCRIPTION_VALIDITY_MONTHS = 6;

/**
 * Fallback file count, used until the backend serves `maxFiles` on the upload
 * settings endpoint. Prefer `useUploadConfig().maxFiles`, which applies the
 * remote value; this is only the default when none has arrived.
 */
export const MAX_FILES = 10;

/** Hard ceiling on the remote value — ten large images already strain low-end Android. */
export const MAX_FILES_CEILING = 20;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "pdf"]);

export const isAllowedFile = (mimeType: string, name: string): boolean => {
  if (ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) return true;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.has(ext);
};

const parseSize = (val: unknown): number => {
  if (typeof val === "number" && Number.isFinite(val) && val > 0) {
    return Math.floor(val);
  }
  if (typeof val === "string") {
    const parsed = parseInt(val, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }
  return 0;
};

function extFromAsset(uri: string, mimeType: string): string {
  const fromUri = uri.split(".").pop()?.split("?")[0]?.toLowerCase();
  if (fromUri && ALLOWED_EXTENSIONS.has(fromUri)) return fromUri;
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };
  return mimeMap[mimeType.toLowerCase()] ?? "tmp";
}

async function resolveToLocalUri(
  uri: string,
  mimeType: string,
): Promise<{ localUri: string; isCopy: boolean }> {
  const needsCopy =
    uri.startsWith("content://") ||
    uri.startsWith("ph://") ||
    uri.startsWith("assets-library://");

  if (!needsCopy) return { localUri: uri, isCopy: false };

  const ext = extFromAsset(uri, mimeType);
  // Use 'any' cast to bypass type-system inconsistencies in specific Expo versions
  const baseDir = Paths.cache;
  const suffix = Math.random().toString(36).slice(2, 9);
  const destFile = new File(baseDir, `prescription_${suffix}.${ext}`);
  const dest = destFile.uri;

  const sourceFile = new File(uri);
  sourceFile.copy(destFile);
  return { localUri: dest, isCopy: true };
}

export async function validatePrescriptionFile(
  asset:
    | DocumentPicker.DocumentPickerAsset
    | ImagePicker.ImagePickerAsset
    | CapturedAsset,
  onError?: (title: string, message: string) => void,
  onSizeExceeded?: (sizeMB: string) => void,
  // Passed in rather than read here: this is a plain util and cannot call the
  // hook that fetches the backend limit. Callers supply it via useUploadConfig.
  maxSizeBytes: number = MAX_SIZE_BYTES,
): Promise<PrescriptionItem | null> {
  const limitLabel = `${Math.round(maxSizeBytes / (1024 * 1024))} MB`;
  const uri = asset.uri;
  // The three asset unions spell the name/size fields differently; read both.
  const raw = asset as {
    name?: string;
    fileName?: string | null;
    size?: number | string | null;
    fileSize?: number | string | null;
  };
  const name = raw.name ?? raw.fileName ?? uri.split("/").pop() ?? "file";
  const type =
    asset.mimeType ??
    (name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");

  if (!isAllowedFile(type, name)) {
    onError?.("Unsupported Format", `The file "${name}" is not supported.`);
    return null;
  }

  // Step 1: Fast reject via picker-reported size
  let size = parseSize(raw.size ?? raw.fileSize);

  // Performance optimization: If picker already says it's too big, reject immediately
  // to avoid the expensive copy/resolve operation.
  if (size > maxSizeBytes) {
    const sizeMB = (size / (1024 * 1024)).toFixed(2);
    if (onSizeExceeded) onSizeExceeded(sizeMB);
    else
      onError?.(
        "Upload Restriction",
        `"${name}" is ${sizeMB} MB — maximum allowed is ${limitLabel}.`,
      );
    return null;
  }

  let resolvedUri = uri;
  let isCopy = false;

  // Step 2: Verify with FileSystem (picker sizes are unreliable, but we only do this if Step 1 passes)
  try {
    // Resolve to a local URI so getInfoAsync works on all platforms
    ({ localUri: resolvedUri, isCopy } = await resolveToLocalUri(uri, type));

    const file = new File(resolvedUri);
    const info = file.info();

    if (
      info.exists &&
      "size" in info &&
      typeof info.size === "number" &&
      info.size > 0
    ) {
      size = info.size;
      if (__DEV__)
        logger.debug(
          `[Prescription] FS-verified size for "${name}": ${size} bytes`,
        );
    } else {
      if (__DEV__)
        console.warn(
          `[Prescription] FS size unavailable for "${name}", using picker size: ${size}`,
        );
    }
  } catch (e) {
    if (__DEV__)
      console.error("[Prescription] Failed to resolve/stat file:", e);
  }

  if (__DEV__)
    logger.debug(
      `[Prescription] Final size for "${name}": ${size} bytes (limit: ${maxSizeBytes})`,
    );

  const cleanup = () => {
    if (isCopy) {
      const file = new File(resolvedUri);
      try {
        file.delete();
      } catch (e) {
        if (__DEV__) console.warn("[Prescription] Cleanup failed:", e);
      }
    }
  };

  if (size <= 0) {
    cleanup();
    onError?.(
      "Upload Restriction",
      `Could not determine the size of "${name}".`,
    );
    return null;
  }

  if (size > maxSizeBytes) {
    cleanup();
    const sizeMB = (size / (1024 * 1024)).toFixed(2);
    if (onSizeExceeded) onSizeExceeded(sizeMB);
    else
      onError?.(
        "Upload Restriction",
        `"${name}" is ${sizeMB} MB — maximum allowed is ${limitLabel}.`,
      );
    return null;
  }

  // isCopy is carried on the item so the uploader can delete the cache copy
  // once the bytes are safely on the server — see deleteTempCopy below.
  return { localUri: resolvedUri, name, type, size, isTempCopy: isCopy };
}

/**
 * Removes the cache copy this app made for an upload.
 *
 * Deliberately a no-op unless `isTempCopy` is set, so it can never touch the
 * user's original gallery or document file. Call it only after the upload has
 * succeeded — a failed file must stay on disk for retry.
 */
export function deleteTempCopy(item: PrescriptionItem): void {
  if (!item.isTempCopy) return;
  try {
    new File(item.localUri).delete();
  } catch (e) {
    // Best-effort: a stale cache file is not worth failing an upload over.
    if (__DEV__) logger.debug("[Prescription] Temp cleanup failed:", e);
  }
}

/**
 * Dedupes a freshly-picked/scanned batch against both itself and the current
 * draft, using the same `name_size_type` key `usePrescriptionDraftStore` and
 * `usePrescriptionUploader` already use — so the notice this drives always
 * agrees with what the store will actually keep. Also trims to whatever
 * remaining slots `maxFiles` leaves, same as before: picking 11 when 10 are
 * free still loads 10, not nothing.
 */
export function dedupeAgainstDraft(
  files: PrescriptionItem[],
  currentItems: PrescriptionItem[],
  maxFiles: number,
): {
  accepted: PrescriptionItem[];
  overLimit: boolean;
  hadDuplicates: boolean;
  firstDuplicate: PrescriptionItem | null;
} {
  const keyOf = (it: { name: string; size?: number | null; type: string }) =>
    `${it.name}_${it.size ?? 0}_${it.type}`;

  const existingKeys = new Set(currentItems.map(keyOf));
  const seenKeys = new Set(existingKeys);
  const uniqueInSelection: PrescriptionItem[] = [];
  let hadDuplicates = false;
  let firstDuplicate: PrescriptionItem | null = null;

  for (const f of files) {
    const key = keyOf(f);
    if (seenKeys.has(key)) {
      hadDuplicates = true;
      if (!firstDuplicate) firstDuplicate = f;
    } else {
      uniqueInSelection.push(f);
      seenKeys.add(key);
    }
  }

  const remainingSlots = Math.max(maxFiles - currentItems.length, 0);
  const overLimit = uniqueInSelection.length > remainingSlots;
  const accepted = overLimit
    ? uniqueInSelection.slice(0, remainingSlots)
    : uniqueInSelection;

  return { accepted, overLimit, hadDuplicates, firstDuplicate };
}
