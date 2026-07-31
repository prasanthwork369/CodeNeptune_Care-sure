import { Platform, Alert } from "react-native";
import { Asset } from "expo-asset";
import * as Notifications from "expo-notifications";
import { isExpoGo } from "./environment";
import { logger } from "@/src/utils/logger";

// react-native-blob-util is a native module unavailable in Expo Go
const getBlobUtil = ():
  | typeof import("react-native-blob-util").default
  | null => (isExpoGo ? null : require("react-native-blob-util").default);

/**
 * Downloads a remote file from a URL to the local device storage.
 * On Android: Uses system DownloadManager to save to the Downloads folder.
 * On iOS: Saves to Document directory and opens a system document viewer/sharing sheet.
 *
 * @param url The URL of the file to download
 * @param fileName Optional custom name for the downloaded file
 */
export const downloadFile = async (
  url: string,
  fileName?: string,
): Promise<void> => {
  try {
    const ReactNativeBlobUtil = getBlobUtil();
    if (!ReactNativeBlobUtil) {
      Alert.alert(
        "Not Available",
        "File downloads require the development build and are not available in Expo Go.",
      );
      return;
    }

    if (!url) {
      Alert.alert("Error", "Invalid download URL provided.");
      return;
    }

    // Clean up and construct standard file name and extension
    const urlPart = url.split("?")[0]; // Remove query params if any
    const originalName = urlPart.split("/").pop() || "prescription";

    // Extract original extension from the URL/original filename
    const originalExtension = originalName.includes(".")
      ? originalName.split(".").pop()?.toLowerCase() || "jpg"
      : "jpg";

    const name = fileName || originalName.split(".")[0];
    const finalFileName = name.toLowerCase().endsWith(`.${originalExtension}`)
      ? name
      : `${name}.${originalExtension}`;

    const { dirs } = ReactNativeBlobUtil.fs;
    const mimeType =
      originalExtension === "pdf"
        ? "application/pdf"
        : `image/${originalExtension === "png" ? "png" : "jpeg"}`;

    if (Platform.OS === "android") {
      const destPath = `${dirs.DownloadDir}/${finalFileName}`;

      // Trigger Android system DownloadManager
      await ReactNativeBlobUtil.config({
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: finalFileName,
          description: "Downloading prescription...",
          mime: mimeType,
          path: destPath,
        },
      }).fetch("GET", url);
    } else {
      // iOS: Download to local app storage, then preview/share
      const localPath = `${dirs.DocumentDir}/${finalFileName}`;
      const res = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: localPath,
      }).fetch("GET", url);

      if (res.path()) {
        await ReactNativeBlobUtil.ios.previewDocument(res.path());
      } else {
        throw new Error("Failed to save file to local cache.");
      }
    }
  } catch (error: any) {
    Alert.alert(
      "Download Error",
      error.message || "Failed to download prescription. Please try again.",
    );
  }
};

// Shared save routine for an already-local file — Android copies it to the public
// Downloads folder (media scan + notification + open), iOS previews/shares it in place.
// Both downloadLocalAsset and downloadLocalFile funnel through here to avoid duplicating this.
const persistLocalFile = async (
  ReactNativeBlobUtil: typeof import("react-native-blob-util").default,
  fileUri: string,
  fileName: string,
): Promise<void> => {
  // Clean up and construct standard file name and extension
  const urlPart = fileUri.split("?")[0];
  const originalName = urlPart.split("/").pop() || "file";
  const originalExtension = originalName.includes(".")
    ? originalName.split(".").pop()?.toLowerCase() || "pdf"
    : "pdf";

  const name = fileName || originalName.split(".")[0];
  const finalFileName = name.toLowerCase().endsWith(`.${originalExtension}`)
    ? name
    : `${name}.${originalExtension}`;

  const isInvoice = finalFileName.toLowerCase().includes("invoice");
  const itemTypeLabel = isInvoice ? "Invoice" : "File";

  const { dirs } = ReactNativeBlobUtil.fs;
  const mimeType =
    originalExtension === "pdf"
      ? "application/pdf"
      : `image/${originalExtension === "png" ? "png" : "jpeg"}`;

  const cleanSourcePath = fileUri.replace("file://", "");

  if (Platform.OS === "android") {
    const destPath = `${dirs.DownloadDir}/${finalFileName}`;
    // Copy the local file to Download directory
    await ReactNativeBlobUtil.fs.cp(cleanSourcePath, destPath);
    // Scan the file so it shows in downloads
    try {
      await ReactNativeBlobUtil.fs.scanFile([
        { path: destPath, mime: mimeType },
      ]);
    } catch (scanError) {
      if (__DEV__) logger.debug("Error scanning file:", scanError);
    }

    // Show notification in Android notification tray using expo-notifications
    try {
      let { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        status = newStatus;
      }
      if (status === "granted") {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${itemTypeLabel} Downloaded`,
            body: `${finalFileName} saved to Downloads folder successfully`,
          },
          trigger: null,
        });
      }
    } catch (notifError) {
      if (__DEV__) logger.debug("Error scheduling notification:", notifError);
    }

    // Open the file immediately on Android using actionViewIntent
    try {
      await ReactNativeBlobUtil.android.actionViewIntent(destPath, mimeType);
    } catch (openError) {
      if (__DEV__) logger.debug("Error opening file:", openError);
      Alert.alert(
        "Success",
        `${itemTypeLabel} saved to Downloads folder: ${finalFileName}`,
      );
    }
  } else {
    // iOS: Preview/share the local file directly from its path
    await ReactNativeBlobUtil.ios.previewDocument(cleanSourcePath);
  }
};

/**
 * Saves a local required asset (like a bundled PDF or Image) to the local device storage.
 * On Android: Copies the asset to the public Downloads folder, triggers a viewer intent, and shows a notification.
 * On iOS: Previews/shares the local asset directly.
 *
 * @param assetModule The local required asset module ID (e.g. require('...'))
 * @param fileName Custom name for the saved file (e.g. 'Invoice')
 */
export const downloadLocalAsset = async (
  assetModule: number,
  fileName: string,
): Promise<void> => {
  try {
    const ReactNativeBlobUtil = getBlobUtil();
    if (!ReactNativeBlobUtil) {
      Alert.alert(
        "Not Available",
        "File downloads require the development build and are not available in Expo Go.",
      );
      return;
    }

    if (!assetModule) {
      Alert.alert("Error", "Invalid asset provided.");
      return;
    }

    // Resolve local required asset via expo-asset
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();
    const fileUri = asset.localUri;

    if (!fileUri) {
      Alert.alert("Error", "Could not resolve asset file path.");
      return;
    }

    await persistLocalFile(ReactNativeBlobUtil, fileUri, fileName);
  } catch (error: any) {
    Alert.alert(
      "Download Error",
      error.message || "Failed to save file. Please try again.",
    );
  }
};

/**
 * Saves an already-generated local file (e.g. a PDF produced by expo-print's
 * printToFileAsync) to the device using the same Downloads/preview behavior as
 * downloadLocalAsset. The caller owns the temp file and should delete it afterwards.
 *
 * @param uri Local file URI of the generated file (file://…)
 * @param fileName Custom name for the saved file (e.g. 'RX-1234')
 */
export const downloadLocalFile = async (
  uri: string,
  fileName: string,
): Promise<void> => {
  try {
    const ReactNativeBlobUtil = getBlobUtil();
    if (!ReactNativeBlobUtil) {
      Alert.alert(
        "Not Available",
        "File downloads require the development build and are not available in Expo Go.",
      );
      return;
    }

    if (!uri) {
      Alert.alert("Error", "Invalid file provided.");
      return;
    }

    await persistLocalFile(ReactNativeBlobUtil, uri, fileName);
  } catch (error: any) {
    Alert.alert(
      "Download Error",
      error.message || "Failed to save file. Please try again.",
    );
  }
};
