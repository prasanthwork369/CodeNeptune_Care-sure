import { useEffect, useRef } from "react";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { usePrescriptionUploader } from "./usePrescriptionUploader";
import { PrescriptionItem } from "../types";

const FOLDER = "customers/prescriptions";

/**
 * Upload Coordinator: Detects newly-added prescription items and starts uploading
 * immediately, independent of PreviewLayout being mounted.
 *
 * Watches draft store for items with uploadStatus="pending" and automatically
 * calls uploadOne() for each. Syncs upload progress/results back to draft.
 *
 * Handles restart scenarios where uploads were interrupted.
 */
export function useUploadCoordinator(): void {
  const items = usePrescriptionDraftStore((st) => st.items);
  const updateItem = usePrescriptionDraftStore((st) => st.updateItem);
  const uploader = usePrescriptionUploader(FOLDER);
  const cleanedUpRef = useRef(false);

  // Clean up interrupted uploads on mount.
  // If an item was persisted with uploadStatus="uploading" but no uploadedUrl,
  // the upload process is gone (app was killed). Reset to "pending" so it retries.
  useEffect(() => {
    if (cleanedUpRef.current) return;
    cleanedUpRef.current = true;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.uploadStatus === "uploading" && !item.uploadedUrl) {
        updateItem(i, { uploadStatus: "pending" });
      }
    }
  }, [items, updateItem]);

  // Sync upload state from uploader to draft items whenever uploader state changes.
  useEffect(() => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const key = uploader.uploadKeyOf(item);
      const state = uploader.states[key];
      if (!state) continue;

      let updates: Partial<
        Pick<PrescriptionItem, "uploadedUrl" | "uploadStatus" | "uploadError">
      > = {};

      if (state.status === "success" && state.url) {
        updates = {
          uploadedUrl: state.url,
          uploadStatus: "uploaded",
          uploadError: undefined,
        };
      } else if (state.status === "error") {
        updates = {
          uploadStatus: "error",
          uploadError: state.error,
        };
      } else if (state.status === "uploading") {
        updates = { uploadStatus: "uploading" };
      } else if (state.status === "pending") {
        updates = { uploadStatus: "pending" };
      }

      if (Object.keys(updates).length > 0) {
        updateItem(i, updates);
      }
    }
  }, [items, uploader.states, updateItem]);

  // Start uploading items immediately when they're added to the draft.
  // Do not wait for PreviewLayout to mount.
  useEffect(() => {
    const itemsToUpload = items.filter(
      (item) =>
        !item.uploadedUrl &&
        item.uploadStatus !== "uploading" &&
        item.uploadStatus !== "uploaded" &&
        item.uploadStatus !== "error",
    );
    if (itemsToUpload.length > 0) {
      for (const item of itemsToUpload) {
        uploader.uploadOne(item);
      }
    }
  }, [items, uploader]);
}
