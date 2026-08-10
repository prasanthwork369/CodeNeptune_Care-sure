import { storageApi } from "@/src/api/storage.api";
import { PrescriptionItem } from "@/src/types/prescription";
import { networkErrorMessage } from "@/src/utils/offline";
import { toAppError } from "@/src/api/errors";
import { useCallback, useEffect, useRef, useState } from "react";

export type UploadStatus = "pending" | "uploading" | "success" | "error";

export interface FileUploadState {
  status: UploadStatus;
  /** 0-100. Real bytes when the transport reports them, else 0 until done. */
  progress: number;
  url?: string;
  error?: string;
}

/**
 * Two at a time: each in-flight multipart request holds a native buffer, and
 * older low-memory Android devices fall over when ten large files stream at
 * once. Two still halves the wall-clock time of the previous serial loop.
 */
const MAX_CONCURRENT = 2;
// Byte events fire continuously; without this every upload would re-render the list per chunk.
const PROGRESS_THROTTLE_MS = 200;

/** Matches the draft store's dedupe key, so items already have unique keys. */
export const uploadKeyOf = (item: PrescriptionItem): string =>
  `${item.name}_${item.size ?? 0}_${item.type}`;

const isHosted = (uri: string) => /^https?:\/\//i.test(uri);

/**
 * Owns per-file upload state so progress re-renders the thumbnail list rather
 * than the whole preview screen. Successful URLs are kept in a ref, so a retry
 * re-sends only the failed file and never re-uploads what already succeeded.
 */
export function usePrescriptionUploader(folder: string) {
  const [states, setStates] = useState<Record<string, FileUploadState>>({});
  const [isUploading, setIsUploading] = useState(false);
  // Survives re-renders and retries; the source of truth for "already uploaded".
  const urlsRef = useRef<Record<string, string>>({});
  // Ref, not state, so a double tap in the same tick cannot start a second run.
  const runningRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const patch = useCallback((key: string, next: Partial<FileUploadState>) => {
    if (!mountedRef.current) return;
    setStates((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? { status: "pending", progress: 0 }), ...next },
    }));
  }, []);

  const uploadOne = useCallback(
    async (item: PrescriptionItem) => {
      const key = uploadKeyOf(item);

      // Already a remote URL: the existing contract sends these straight through.
      if (isHosted(item.localUri)) {
        urlsRef.current[key] = item.localUri;
        patch(key, { status: "success", progress: 100, url: item.localUri });
        return;
      }

      // Succeeded on an earlier attempt — never pay for it twice.
      const existing = urlsRef.current[key];
      if (existing) {
        patch(key, { status: "success", progress: 100, url: existing });
        return;
      }

      patch(key, { status: "uploading", progress: 0, error: undefined });

      let lastEmit = 0;
      let lastPct = -1;
      try {
        const { url } = await storageApi.upload(
          { uri: item.localUri, name: item.name, type: item.type },
          folder,
          {
            onProgress: (pct) => {
              const now = Date.now();
              const settled = pct >= 100;
              if (
                !settled &&
                (now - lastEmit < PROGRESS_THROTTLE_MS || pct === lastPct)
              ) {
                return;
              }
              lastEmit = now;
              lastPct = pct;
              patch(key, { status: "uploading", progress: pct });
            },
          },
        );
        urlsRef.current[key] = url;
        patch(key, { status: "success", progress: 100, url });
      } catch (e) {
        // Inline per file only — a toast per failure would stack duplicates.
        patch(key, {
          status: "error",
          progress: 0,
          error: networkErrorMessage(toAppError(e).kind),
        });
      }
    },
    [folder, patch],
  );

  /** Fixed-size worker pool; a slow file never blocks the rest of the queue. */
  const runPool = useCallback(
    async (items: PrescriptionItem[]) => {
      let cursor = 0;
      const workers = Array.from(
        { length: Math.min(MAX_CONCURRENT, items.length) },
        async () => {
          while (cursor < items.length) {
            const item = items[cursor++];
            await uploadOne(item);
          }
        },
      );
      await Promise.all(workers);
    },
    [uploadOne],
  );

  /**
   * Uploads everything not already hosted. Resolves to the ordered URL list on
   * full success, or null when any file failed — the caller must not navigate
   * on null so the user stays put and can retry.
   */
  const uploadAll = useCallback(
    async (items: PrescriptionItem[]): Promise<string[] | null> => {
      if (runningRef.current) return null;
      runningRef.current = true;
      setIsUploading(true);

      // Seed so every thumbnail shows "Waiting" immediately, before any request.
      if (mountedRef.current) {
        setStates((prev) => {
          const seeded: Record<string, FileUploadState> = { ...prev };
          for (const item of items) {
            const key = uploadKeyOf(item);
            if (seeded[key]?.status === "success") continue;
            seeded[key] = { status: "pending", progress: 0 };
          }
          return seeded;
        });
      }

      try {
        await runPool(items);
        const urls = items.map((i) => urlsRef.current[uploadKeyOf(i)]);
        return urls.every(Boolean) ? urls : null;
      } finally {
        runningRef.current = false;
        if (mountedRef.current) setIsUploading(false);
      }
    },
    [runPool],
  );

  /** Re-sends a single failed file, leaving every successful URL intact. */
  const retryOne = useCallback(
    async (item: PrescriptionItem) => {
      if (runningRef.current) return;
      runningRef.current = true;
      setIsUploading(true);
      try {
        await uploadOne(item);
      } finally {
        runningRef.current = false;
        if (mountedRef.current) setIsUploading(false);
      }
    },
    [uploadOne],
  );

  const reset = useCallback(() => {
    urlsRef.current = {};
    setStates({});
  }, []);

  return { states, isUploading, uploadAll, retryOne, reset };
}
