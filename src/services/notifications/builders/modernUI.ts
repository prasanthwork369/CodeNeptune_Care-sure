import { Image } from "react-native";
const getNotifee = () => require("@notifee/react-native");

export const modernUIBuilders = {
  buildBigPicturePromotion: () => {
    const { AndroidStyle } = getNotifee();
    const bannerUri = Image.resolveAssetSource(require("../../../../assets/images/icon.png")).uri;
    return {
      title: "Exclusive Offer 🎁",
      body: "Get 25% off on health essentials today. Tap to shop now!",
      android: {
        channelId: "playground_basic",
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: bannerUri,
        },
      },
    };
  },
  buildMessagingStyle: () => {
    const { AndroidStyle } = getNotifee();
    return {
      title: "Doctor Chat Update 👨‍⚕️",
      body: "Dr. Sharma sent a message.",
      android: {
        channelId: "playground_basic",
        style: {
          type: AndroidStyle.MESSAGING,
          person: {
            name: "Dr. Sharma",
          },
          messages: [
            {
              text: "Hello! I reviewed your blood reports.",
              timestamp: Date.now() - 60000,
            },
            {
              text: "Your HbA1c is normal. Continue the same dosage.",
              timestamp: Date.now(),
              person: {
                name: "Dr. Sharma",
              },
            },
          ],
        },
      },
    };
  },
  buildInboxStyle: () => {
    const { AndroidStyle } = getNotifee();
    return {
      title: "Your Health Updates 📝",
      body: "Summary of today's health updates.",
      android: {
        channelId: "playground_basic",
        style: {
          type: AndroidStyle.INBOX,
          lines: [
            "Prescription approved for order #CS-8941",
            "Consultation scheduled with Dr. Verma at 5 PM",
            "Daily steps goal completed: 10,240 steps",
          ],
        },
      },
    };
  },
  buildGrouped: (itemId: number) => {
    const groupKey = "ui_demo_group";
    return {
      id: `ui_group_item_${itemId}`,
      title: `Update #${itemId}`,
      body: `This is health notification update detail #${itemId}`,
      android: {
        channelId: "playground_basic",
        groupId: groupKey,
      },
    };
  },
  buildGroupSummary: (count: number) => {
    const groupKey = "ui_demo_group";
    return {
      id: "ui_group_summary",
      title: "CareSure Summary",
      body: `${count} new health updates available.`,
      android: {
        channelId: "playground_basic",
        groupId: groupKey,
        groupSummary: true,
      },
    };
  },
  buildActionButtons: () => ({
    title: "Appointment Request 📞",
    body: "Dr. Sharma is ready for your consultation. Join the call?",
    android: {
      channelId: "playground_basic",
      actions: [
        {
          title: "Join Now",
          pressAction: { id: "join_call" },
        },
        {
          title: "Dismiss",
          pressAction: { id: "dismiss" },
        },
      ],
    },
  }),
  buildPersistent: () => ({
    id: "persistent_demo_id",
    title: "Ongoing Session 🔒",
    body: "Secured connection is active. Tap to open dashboard.",
    android: {
      channelId: "playground_basic",
      ongoing: true,
      color: "#0F7635",
    },
  }),
  buildSilent: () => {
    const { AndroidImportance } = getNotifee();
    return {
      title: "Silent Health Check",
      body: "Background telemetry check complete.",
      android: {
        channelId: "playground_progress",
        importance: AndroidImportance.LOW,
      },
    };
  },
  buildHeadsUp: () => {
    const { AndroidImportance } = getNotifee();
    return {
      title: "CRITICAL: Medicine Alert 🚨",
      body: "Take your critical prescription dosage immediately!",
      android: {
        channelId: "playground_basic",
        importance: AndroidImportance.HIGH,
        fullScreenAction: {
          id: "default",
        },
        color: "#CA2B25",
      },
    };
  },
};
