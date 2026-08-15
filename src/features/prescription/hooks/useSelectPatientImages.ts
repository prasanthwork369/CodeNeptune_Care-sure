import type { CapturedAsset } from "../scanner";
import { asError } from "@/src/api/errors";
import {
  deriveKeyFromUrl,
  storageApi,
  UploadedImage,
} from "@/src/api/storage.api";
import { useUploadConfig } from "@/src/hooks/queries/useSettings";
import { PrescriptionItem } from "../types";
import {
  validatePrescriptionFile,
  capturePrescriptionImages,
  deleteTempCopy,
} from "../utils/prescription";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";
import { logger } from "@/src/utils/logger";
import { requireInternet } from "@/src/utils/offline";

// Must match the storage folder Preview uploads to, so all prescription
// images for an order land in the same place.
const FOLDER = "customers/prescriptions";

/**
 * Owns the prescription image list on the Select Patient screen for the
 * deferred-creation (order) flow. Images added here are uploaded to storage
 * immediately (to get a hosted URL) and appended to `hostedUrls`, which is
 * carried to payment where the single prescription record is created. The
 * record is NOT created here — see [defer-to-payment] flow.
 *
 * Seeds from the route params passed by Preview:
 *  - `filesParam`     JSON of PrescriptionItem[] (for display thumbnails)
 *  - `imageUrlsParam` JSON of already-hosted image URLs
 */
export function useSelectPatientImages(
  filesParam: string,
  imageUrlsParam: string,
) {
  const { maxSizeBytes, maxFiles } = useUploadConfig();

  const parse = <T>(raw: string, fallback: T): T => {
    try {
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };

  const [items, setItems] = useState<PrescriptionItem[]>(() =>
    parse<PrescriptionItem[]>(filesParam, []),
  );
  // Kept index-aligned with `items`. `url` feeds the payload/display, `path`
  // is the delete key. Seeded images only carry a url, so their path is
  // derived (best-effort) from the url.
  const [hosted, setHosted] = useState<UploadedImage[]>(() =>
    parse<string[]>(imageUrlsParam, []).map((url) => ({
      url,
      path: deriveKeyFromUrl(url),
    })),
  );
  const hostedUrls = hosted.map((h) => h.url);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  // Validates each picked asset, uploads it to storage, and appends the
  // resulting URL + a display item. Uses the uploaded URL as the item's
  // localUri so the thumbnail renders the hosted image.
  // CapturedAsset covers the scanner's own minimal shape, which carries no
  // picker metadata — validatePrescriptionFile already accepts all three.
  const addAssets = async (
    assets: (
      | DocumentPicker.DocumentPickerAsset
      | ImagePicker.ImagePickerAsset
      | CapturedAsset
    )[],
  ) => {
    // Each asset is uploaded to storage, so none of this works offline.
    if (!requireInternet()) return;
    setIsAddingImage(true);
    try {
      const newItems: PrescriptionItem[] = [];
      const newUploads: UploadedImage[] = [];
      for (const asset of assets) {
        if (items.length + newItems.length >= maxFiles) {
          Alert.alert(
            "Limit Reached",
            `You can add a maximum of ${maxFiles} prescriptions.`,
          );
          break;
        }
        const item = await validatePrescriptionFile(
          asset,
          (title, message) => Alert.alert(title, message),
          undefined,
          maxSizeBytes,
        );
        if (!item) continue;
        const uploaded = await storageApi.upload(
          { uri: item.localUri, name: item.name, type: item.type },
          FOLDER,
        );
        newUploads.push(uploaded);
        // Bytes are on the server, so the cache copy can go.
        deleteTempCopy(item);
        // localUri is now the hosted URL, so it is no longer a temp copy —
        // clearing the flag stops any later cleanup treating it as one.
        newItems.push({ ...item, localUri: uploaded.url, isTempCopy: false });
      }
      if (newUploads.length > 0) {
        setHosted((prev) => [...prev, ...newUploads]);
        setItems((prev) => [...prev, ...newItems]);
      }
    } catch {
      Alert.alert(
        "Upload Failed",
        "Could not add the image. Please try again.",
      );
    } finally {
      setIsAddingImage(false);
    }
  };

  const addFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access in Settings to continue.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as ImagePicker.MediaType[],
        quality: 0.9,
        allowsMultipleSelection: true,
      });
      if (!result.canceled && result.assets.length > 0)
        await addAssets(result.assets);
    } catch {
      Alert.alert("Error", "Failed to pick images. Please try again.");
    }
  };

  const addFromCamera = async () => {
    try {
      const { status, canAskAgain } =
        await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        if (!canAskAgain)
          Alert.alert(
            "Permission Required",
            "Please allow camera access in Settings to continue.",
          );
        return;
      }
      const scannedUris = await capturePrescriptionImages();
      if (scannedUris.length > 0) {
        // One asset per scanned page, so multi-page scans are all kept.
        const assets = scannedUris.map((uri, index) => {
          const filename =
            uri.split("/").pop() || `scanned_prescription_${index + 1}.jpg`;
          return {
            uri,
            name: filename,
            fileName: filename,
            mimeType: "image/jpeg",
          };
        });
        await addAssets(assets);
      }
    } catch {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const addFromPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (!result.canceled && result.assets.length > 0)
        await addAssets(result.assets);
    } catch {
      Alert.alert("Error", "Failed to pick PDF. Please try again.");
    }
  };

  // Deletes the image from storage by its path, then drops it from both lists.
  // We remove locally only after the delete succeeds, so a failed call leaves
  // the image in place rather than silently losing it.
  const removeImage = async (index: number) => {
    const target = hosted[index];
    if (!target || removingIndex !== null) return;
    // Gate before the spinner: an offline tap must look inert, not busy.
    if (!requireInternet()) return;
    setRemovingIndex(index);
    try {
      if (__DEV__)
        logger.debug("[removeImage] DELETE /storage/delete key:", target.path);
      await storageApi.delete(target.path);
      setHosted((prev) => prev.filter((_, i) => i !== index));
      setItems((prev) => prev.filter((_, i) => i !== index));
    } catch (e) {
      const err = asError(e);
      if (__DEV__)
        logger.debug("[removeImage] delete FAILED", {
          key: target.path,
          kind: err?.kind,
          status: err?.status,
          message: err?.message,
          data: JSON.stringify(err?.data),
        });
      Alert.alert(
        "Couldn't remove image",
        err?.message || "Please check your connection and try again.",
      );
    } finally {
      setRemovingIndex(null);
    }
  };

  return {
    items,
    hostedUrls,
    isAddingImage,
    removingIndex,
    addFromLibrary,
    addFromCamera,
    addFromPdf,
    removeImage,
  };
}
