import { isExpoGo } from "@/src/utils/environment";
import { Image } from "react-native";

const getNotifee = () => require("@notifee/react-native");

let channelsReady = false;
async function ensurePlaygroundChannels(): Promise<any> {
  if (isExpoGo) return null;
  if (channelsReady) return getNotifee().default;
  
  const notifee = getNotifee().default;
  const { AndroidImportance } = getNotifee();
  
  await notifee.createChannel({
    id: "playground_basic",
    name: "Playground: Basic Notifications",
    importance: AndroidImportance.HIGH,
  });

  await notifee.createChannel({
    id: "playground_reminders",
    name: "Playground: Reminders",
    importance: AndroidImportance.HIGH,
  });

  await notifee.createChannel({
    id: "playground_progress",
    name: "Playground: Progress & Downloads",
    importance: AndroidImportance.DEFAULT,
    vibration: false,
    playSound: false,
  });

  channelsReady = true;
  return notifee;
}

export const NotificationService = {
  // 1. Basic Notification
  triggerBasic: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    await notifee.displayNotification({
      title: "CareSure Health",
      body: "Your daily health checkup is ready. View now!",
      android: {
        channelId: "playground_basic",
      },
    });
  },

  // 2. Big Text Notification
  triggerBigText: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    const { AndroidStyle } = getNotifee();
    await notifee.displayNotification({
      title: "Health Tip of the Day",
      body: "Tap to read about the benefits of daily hydration...",
      android: {
        channelId: "playground_basic",
        style: {
          type: AndroidStyle.BIGTEXT,
          text: "Drinking enough water each day is crucial for many reasons: to regulate body temperature, keep joints lubricated, prevent infections, deliver nutrients to cells, and keep organs functioning properly. Being well-hydrated also improves sleep quality, cognition, and mood.",
        },
      },
    });
  },

  // 3. Big Picture Notification
  triggerBigPicture: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    const { AndroidStyle } = getNotifee();
    const pictureUri = Image.resolveAssetSource(require("../../../assets/images/icon.png")).uri;
    await notifee.displayNotification({
      title: "New Health Goal Achieved!",
      body: "You completed your 10,000 steps today.",
      android: {
        channelId: "playground_basic",
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: pictureUri,
        },
      },
    });
  },

  // 4. Progress Notification (0-100%)
  triggerProgress: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    let progress = 0;
    const interval = setInterval(async () => {
      progress += 20;
      await notifee.displayNotification({
        id: "progress_demo",
        title: "Syncing Health Data...",
        body: `Updating offline database: ${progress}%`,
        android: {
          channelId: "playground_progress",
          progress: { max: 100, current: progress, indeterminate: false },
          onlyAlertOnce: true,
          ongoing: true,
        },
      });

      if (progress >= 100) {
        clearInterval(interval);
        await notifee.displayNotification({
          id: "progress_demo",
          title: "Sync Completed",
          body: "Your offline database is fully updated.",
          android: {
            channelId: "playground_progress",
            ongoing: false,
          },
        });
      }
    }, 1000);
  },

  // 5. Download Completed
  triggerDownloadCompleted: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    await notifee.displayNotification({
      title: "Download Completed",
      body: "lab_report_2026.pdf (1.2 MB)",
      android: {
        channelId: "playground_progress",
      },
    });
  },

  // 6. Invoice Downloaded
  triggerInvoiceDownloaded: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    await notifee.displayNotification({
      title: "Invoice Saved",
      body: "Order #CS-8941 Invoice has been saved to your downloads.",
      android: {
        channelId: "playground_progress",
      },
    });
  },

  // 7. Upload Completed
  triggerUploadCompleted: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    await notifee.displayNotification({
      title: "Prescription Uploaded",
      body: "prescription_scan.jpg has been verified and uploaded successfully.",
      android: {
        channelId: "playground_basic",
      },
    });
  },

  // 8. Countdown Timer (1 minute)
  triggerCountdownTimer: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    await notifee.displayNotification({
      title: "OTP Session Active",
      body: "Your secure session will expire soon.",
      android: {
        channelId: "playground_basic",
        showChronometer: true,
        chronometerCountDown: true,
        timestamp: Date.now() + 60000, // 1 minute countdown
      },
    });
  },

  // 9. Scheduled Notification (after 10 seconds)
  triggerScheduled: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    const { TriggerType } = getNotifee();
    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + 10000, // 10 seconds later
    };
    await notifee.createTriggerNotification(
      {
        title: "Scheduled Alert",
        body: "This is your 10-second scheduled test reminder.",
        android: {
          channelId: "playground_reminders",
        },
      },
      trigger
    );
  },

  // 10. Medicine Reminder
  triggerMedicineReminder: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    const { AndroidCategory } = getNotifee();
    await notifee.displayNotification({
      title: "Dosage Reminder: Metformin 500mg",
      body: "Take 1 tablet after dinner as prescribed by Dr. Sharma.",
      android: {
        channelId: "playground_reminders",
        category: AndroidCategory.REMINDER,
      },
    });
  },

  // 11. Cart Reminder
  triggerCartReminder: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    await notifee.displayNotification({
      title: "Cart Abandoned",
      body: "Complete your checkout now to receive 10% off your medicine order.",
      android: {
        channelId: "playground_basic",
      },
    });
  },

  // 12. Success Notification
  triggerSuccess: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    await notifee.displayNotification({
      title: "Payment Successful",
      body: "Order #CS-8941 has been placed successfully.",
      android: {
        channelId: "playground_basic",
        color: "#0F7635", // Branded Green
      },
    });
  },

  // 13. Error Notification
  triggerError: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    await notifee.displayNotification({
      title: "Payment Failed",
      body: "Transaction declined by bank. Please try another payment method.",
      android: {
        channelId: "playground_basic",
        color: "#CA2B25", // Red
      },
    });
  },

  // 14. Warning Notification
  triggerWarning: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    await notifee.displayNotification({
      title: "Prescription Required",
      body: "Some items in your cart require a doctor prescription upload.",
      android: {
        channelId: "playground_basic",
        color: "#E2A93E", // Yellow/Orange
      },
    });
  },

  // 15. Action Buttons (Open, Dismiss)
  triggerActionButtons: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    await notifee.displayNotification({
      title: "Action Required",
      body: "New lab report is ready to open.",
      android: {
        channelId: "playground_basic",
        actions: [
          {
            title: "Open Report",
            pressAction: { id: "open_report" },
          },
          {
            title: "Dismiss",
            pressAction: { id: "dismiss" },
          },
        ],
      },
    });
  },

  // 16. Grouped Notifications
  triggerGrouped: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    const groupKey = "demo_group";

    await notifee.displayNotification({
      id: "group_item_1",
      title: "Doctor Update",
      body: "Your prescription scan was verified.",
      android: {
        channelId: "playground_basic",
        groupId: groupKey,
      },
    });

    await notifee.displayNotification({
      id: "group_item_2",
      title: "Shipping Update",
      body: "Order #CS-8941 has been shipped.",
      android: {
        channelId: "playground_basic",
        groupId: groupKey,
      },
    });

    await notifee.displayNotification({
      id: "group_summary",
      title: "CareSure Updates",
      body: "2 new status updates available",
      android: {
        channelId: "playground_basic",
        groupId: groupKey,
        groupSummary: true,
      },
    });
  },

  // 17. Inbox Style Notification
  triggerInboxStyle: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    const { AndroidStyle } = getNotifee();
    await notifee.displayNotification({
      title: "Summary of Updates",
      body: "You have 3 new notifications",
      android: {
        channelId: "playground_basic",
        style: {
          type: AndroidStyle.INBOX,
          lines: [
            "Prescription verified by Doctor Sharma",
            "Payment of ₹450 received",
            "Delivery partner assigned to your order",
          ],
        },
      },
    });
  },

  // 18. Ongoing/Persistent Notification
  triggerOngoing: async () => {
    if (isExpoGo) return;
    const notifee = await ensurePlaygroundChannels();
    await notifee.displayNotification({
      id: "ongoing_demo",
      title: "Active Session Running",
      body: "This notification cannot be dismissed by swiping.",
      android: {
        channelId: "playground_basic",
        ongoing: true,
        color: "#0F7635",
      },
    });
  },

  // 19. Cancel Notification
  cancelNotification: async (id: string) => {
    if (isExpoGo) return;
    const notifee = getNotifee().default;
    await notifee.cancelNotification(id);
  },

  // 20. Cancel All Notifications
  cancelAll: async () => {
    if (isExpoGo) return;
    const notifee = getNotifee().default;
    await notifee.cancelAllNotifications();
  },
};
