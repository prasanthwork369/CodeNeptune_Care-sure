export const systemBuilders = {
  buildUploadProgress: (current: number = 40) => ({
    title: "Uploading Prescription...",
    body: `Uploading scan: ${current}%`,
    android: {
      channelId: "playground_progress",
      progress: { max: 100, current, indeterminate: false },
      onlyAlertOnce: true,
      ongoing: true,
    },
  }),
  buildDownloadProgress: (current: number = 60) => ({
    title: "Downloading Lab Report...",
    body: `Downloading report: ${current}%`,
    android: {
      channelId: "playground_progress",
      progress: { max: 100, current, indeterminate: false },
      onlyAlertOnce: true,
      ongoing: true,
    },
  }),
  buildBackgroundSync: () => ({
    title: "Syncing Data 🔄",
    body: "Background sync in progress...",
    android: {
      channelId: "playground_progress",
      progress: { indeterminate: true },
      ongoing: true,
    },
  }),
  buildSyncCompleted: () => ({
    title: "Database Synced ✅",
    body: "Your offline database has been successfully updated.",
    android: {
      channelId: "playground_progress",
      ongoing: false,
    },
  }),
  buildBackupCompleted: () => ({
    title: "Backup Completed 💾",
    body: "Your prescriptions & medical profile were backed up safely.",
    android: {
      channelId: "playground_basic",
    },
  }),
  buildStorageWarning: () => ({
    title: "Storage Warning ⚠️",
    body: "Storage is almost full. Clear cached PDF files to save space.",
    android: {
      channelId: "playground_basic",
      color: "#E2A93E",
    },
  }),
  buildSessionExpiry: () => ({
    title: "Session Expiry Warning ⏰",
    body: "Your session will expire in 5 minutes due to inactivity. Please tap to keep session active.",
    android: {
      channelId: "playground_basic",
      color: "#CA2B25",
    },
  }),
  buildInternetRestored: () => ({
    title: "Connected 🟢",
    body: "Internet connection restored. Going online.",
    android: {
      channelId: "playground_basic",
      color: "#0F7635",
    },
  }),
  buildOfflineMode: () => ({
    title: "Offline Mode 🔴",
    body: "No internet connection. Some features will use cached offline data.",
    android: {
      channelId: "playground_basic",
      color: "#CA2B25",
    },
  }),
};
