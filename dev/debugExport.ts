import { Alert, Platform, PermissionsAndroid } from "react-native";
import { db } from "@/src/lib/sqlite/db";
import { isExpoGo } from "@/src/utils/environment";

// react-native-blob-util is a native module unavailable in Expo Go
const getBlobUtil = ():
  | typeof import("react-native-blob-util").default
  | null => (isExpoGo ? null : require("react-native-blob-util").default);

/**
 * Debug utility to export SQLite api_cache and sync_metadata tables into a readable JSON file.
 * This is only enabled in development builds and will do nothing/warn in production.
 *
 * On development with custom client: Saves file to Downloads (Android) or Documents (iOS).
 * On Expo Go: Prints the JSON payload to terminal console.log as file writing is not supported.
 */
export const exportDbToJSON = async (): Promise<string | null> => {
  if (!__DEV__) {
    console.warn("[Debug] Database export is disabled in production builds.");
    return null;
  }

  try {
    // 1. Fetch all cached data and synchronization metadata from SQLite
    const cacheRows = db.getAllSync<{
      key: string;
      data: string;
      updated_at: number;
    }>("SELECT key, data, updated_at FROM api_cache");
    const syncRows = db.getAllSync<{
      component_name: string;
      last_sync_time: string;
    }>("SELECT component_name, last_sync_time FROM sync_metadata");

    // 2. Format database rows into a readable structured JSON object
    const exportData = {
      exported_at: new Date().toISOString(),
      sync_metadata: syncRows.map((row) => ({
        component_name: row.component_name,
        last_sync_time: row.last_sync_time,
      })),
      api_cache: cacheRows.map((row) => {
        let parsedData = row.data;
        try {
          parsedData = JSON.parse(row.data);
        } catch {
          // Keep raw string format if JSON parsing fails
        }
        return {
          key: row.key,
          updated_at: new Date(row.updated_at).toISOString(),
          data: parsedData,
        };
      }),
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    // 3. Handle device storage or console fallback
    const ReactNativeBlobUtil = getBlobUtil();
    if (!ReactNativeBlobUtil) {
      console.log("[Debug] Database Export (JSON):", jsonString);
      Alert.alert(
        "Database Exported (Expo Go)",
        "Database contents have been logged to the terminal console because local file writing is not supported on Expo Go.",
      );
      return "console";
    }

    // Request Android write permission for public storage
    if (Platform.OS === "android") {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (!hasPermission) {
          const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: "Storage Permission Required",
              message: "Storage permission is needed to export the SQLite database to your public Downloads folder.",
              buttonPositive: "Allow",
            }
          );
          if (status !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn("[Debug] Storage permission not granted.");
          }
        }
      } catch (permissionErr) {
        console.warn("[Debug] Permission request failed:", permissionErr);
      }
    }

    const { dirs } = ReactNativeBlobUtil.fs;
    const timestamp = Date.now();
    const jsonFileName = `caresure_db_debug_${timestamp}.json`;
    let destPath = "";

    if (Platform.OS === "android") {
      destPath = `/storage/emulated/0/Download/${jsonFileName}`;
      // Ensure the directory exists
      try {
        const dirExists = await ReactNativeBlobUtil.fs.exists("/storage/emulated/0/Download");
        if (!dirExists) {
          await ReactNativeBlobUtil.fs.mkdir("/storage/emulated/0/Download");
        }
      } catch (dirErr) {
        console.log("[Debug] Directory check/creation error:", dirErr);
      }
    } else {
      destPath = `${dirs.DocumentDir}/${jsonFileName}`;
    }

    // Write file in UTF-8 encoding directly to public folder
    await ReactNativeBlobUtil.fs.writeFile(destPath, jsonString, "utf8");

    // Scan file on Android so it is indexed in Downloads right away
    if (Platform.OS === "android") {
      try {
        await ReactNativeBlobUtil.fs.scanFile([
          { path: destPath, mime: "application/json" },
        ]);
      } catch (scanError) {
        if (__DEV__)
          console.log("Error scanning exported debug JSON file:", scanError);
      }
    }

    // 4. Also copy the raw .db SQLite file for external viewing
    const dbCandidates = [
      `${dirs.DocumentDir}/../databases/caresure.db`,
      `/data/data/com.codeneptune.caresure/databases/caresure.db`,
      `/data/user/0/com.codeneptune.caresure/databases/caresure.db`,
      `${dirs.DocumentDir}/../Library/SQLite/caresure.db`,
      `${dirs.DocumentDir}/SQLite/caresure.db`,
    ];

    let foundDbPath = "";
    for (const path of dbCandidates) {
      try {
        const exists = await ReactNativeBlobUtil.fs.exists(path);
        if (exists) {
          foundDbPath = path;
          break;
        }
      } catch {
        // ignore
      }
    }

    let dbExportedMsg = "";
    if (foundDbPath) {
      const dbFileName = `caresure_db_raw_${timestamp}.db`;
      const dbDestPath = Platform.OS === "android"
        ? `/storage/emulated/0/Download/${dbFileName}`
        : `${dirs.DocumentDir}/${dbFileName}`;

      try {
        await ReactNativeBlobUtil.fs.cp(foundDbPath, dbDestPath);
        if (Platform.OS === "android") {
          await ReactNativeBlobUtil.fs.scanFile([
            { path: dbDestPath, mime: "application/x-sqlite3" },
          ]);
        }
        dbExportedMsg = `\n\nRaw SQLite DB saved to:\n${dbDestPath}`;
      } catch (cpErr) {
        console.warn("[Debug] Failed to copy SQLite file:", cpErr);
      }
    }

    // 5. Automatically upload copies back to host PC workspace if receiver is running
    try {
      const Constants = require("expo-constants").default;
      const manifest = Constants.expoConfig || Constants.manifest;
      const hostUri = manifest?.hostUri;
      if (hostUri) {
        const hostIp = hostUri.split(":")[0];
        // Upload JSON file
        await fetch(`http://${hostIp}:8099`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "File-Name": jsonFileName,
          },
          body: jsonString,
        });

        // Upload raw DB file
        if (foundDbPath) {
          await ReactNativeBlobUtil.fetch(
            "POST",
            `http://${hostIp}:8099`,
            {
              "File-Name": `caresure_db_raw_${timestamp}.db`,
              "Content-Type": "application/octet-stream",
            },
            ReactNativeBlobUtil.wrap(foundDbPath)
          );
        }
      }
    } catch (uploadErr) {
      if (__DEV__) {
        console.log(
          "[Debug] Local sync receiver not running on host PC. Skipping upload.",
          uploadErr
        );
      }
    }

    console.log(
      "Export Successful",
      `JSON saved to: ${destPath}${dbExportedMsg}`
    );
    
    Alert.alert(
      "Export Successful",
      `JSON saved to:\n${destPath}${dbExportedMsg}`,
      [
        {
          text: "Dismiss",
          style: "cancel",
        },
        {
          text: "Open Folder",
          onPress: async () => {
            try {
              if (Platform.OS === "android") {
                await ReactNativeBlobUtil.android.actionViewIntent(
                  "file:///storage/emulated/0/Download",
                  "*/*"
                );
              } else {
                await ReactNativeBlobUtil.ios.previewDocument(dirs.DocumentDir);
              }
            } catch (openError) {
              Alert.alert(
                "Error",
                "No file manager app found to open this folder. Please check your system files."
              );
            }
          },
        },
      ]
    );

    return destPath;
  } catch (error) {
    console.error("[Debug] Failed to export database to JSON:", error);
    Alert.alert(
      "Export Failed",
      "An error occurred while exporting the database.",
    );
    return null;
  }
};

/**
 * Automatically uploads database files to the host PC workspace in the background.
 * Runs silently without showing Alerts or saving to public directories on the device.
 */
export const autoExportDb = async (): Promise<void> => {
  if (!__DEV__) return;

  try {
    const ReactNativeBlobUtil = getBlobUtil();
    if (!ReactNativeBlobUtil) return;

    // 1. Fetch all cached data and synchronization metadata from SQLite
    const cacheRows = db.getAllSync<{
      key: string;
      data: string;
      updated_at: number;
    }>("SELECT key, data, updated_at FROM api_cache");
    const syncRows = db.getAllSync<{
      component_name: string;
      last_sync_time: string;
    }>("SELECT component_name, last_sync_time FROM sync_metadata");

    // 2. Format database rows into a readable structured JSON object
    const exportData = {
      exported_at: new Date().toISOString(),
      sync_metadata: syncRows.map((row) => ({
        component_name: row.component_name,
        last_sync_time: row.last_sync_time,
      })),
      api_cache: cacheRows.map((row) => {
        let parsedData = row.data;
        try {
          parsedData = JSON.parse(row.data);
        } catch {
          // Keep raw string format if JSON parsing fails
        }
        return {
          key: row.key,
          updated_at: new Date(row.updated_at).toISOString(),
          data: parsedData,
        };
      }),
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    // 3. Discover PC Host IP
    const Constants = require("expo-constants").default;
    const manifest = Constants.expoConfig || Constants.manifest;
    const hostUri = manifest?.hostUri;
    if (!hostUri) return;

    const hostIp = hostUri.split(":")[0];
    const jsonFileName = `caresure_db_debug_auto.json`;

    // 4. Upload JSON file
    await fetch(`http://${hostIp}:8099`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "File-Name": jsonFileName,
      },
      body: jsonString,
    });

    // 5. Upload raw DB file
    const dbCandidates = [
      `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/../databases/caresure.db`,
      `/data/data/com.codeneptune.caresure/databases/caresure.db`,
      `/data/user/0/com.codeneptune.caresure/databases/caresure.db`,
      `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/../Library/SQLite/caresure.db`,
      `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/SQLite/caresure.db`,
    ];

    let foundDbPath = "";
    for (const path of dbCandidates) {
      try {
        const exists = await ReactNativeBlobUtil.fs.exists(path);
        if (exists) {
          foundDbPath = path;
          break;
        }
      } catch {
        // ignore
      }
    }

    if (foundDbPath) {
      await ReactNativeBlobUtil.fetch(
        "POST",
        `http://${hostIp}:8099`,
        {
          "File-Name": `caresure_db_raw_auto.db`,
          "Content-Type": "application/octet-stream",
        },
        ReactNativeBlobUtil.wrap(foundDbPath)
      );
    }
  } catch (error) {
    if (__DEV__) {
      console.log("[Debug] Auto export upload failed silently in background:", error);
    }
  }
};
