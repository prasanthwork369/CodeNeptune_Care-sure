import { Image } from "react-native";
const getNotifee = () => require("@notifee/react-native");

const carouselAssets = [
  require("../../../../assets/images/products/multivitamin-bottle.png"),
  require("../../../../assets/images/products/supplements-bottle.png"),
  require("../../../../assets/images/products/medicine-strip.png"),
];

export const interactiveBuilders = {
  buildProgress: (progress: number) => ({
    id: "interactive_progress_demo",
    title: "Uploading Prescriptions 🩺",
    body: progress >= 100 ? "All prescriptions uploaded successfully!" : `Uploading scans: ${progress}%`,
    android: {
      channelId: "playground_progress",
      progress: { max: 100, current: progress, indeterminate: false },
      onlyAlertOnce: true,
      ongoing: progress < 100,
      color: progress >= 100 ? "#0F7635" : undefined,
    },
  }),
  buildCarousel: (index: number) => {
    const { AndroidStyle } = getNotifee();
    const asset = carouselAssets[index % carouselAssets.length];
    const imageUri = Image.resolveAssetSource(asset).uri;
    const titles = [
      "Special Deal: Multivitamin Gummies! 🍬",
      "Supplements Restock Sale: up to 30% OFF! 🏷️",
      "Essential Medicines Refill Bundle Pack! 📦",
    ];
    return {
      id: "interactive_carousel_demo",
      title: titles[index % titles.length],
      body: "Tap to view detail or check next offer.",
      android: {
        channelId: "playground_basic",
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: imageUri,
        },
      },
    };
  },
  buildCountdown: (secondsLeft: number, originalType: string) => {
    const formatTime = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return h > 0 
        ? `${h}h ${m}m ${s}s` 
        : m > 0 
          ? `${m}m ${s}s` 
          : `${s}s`;
    };

    let title = "Countdown Active";
    if (originalType === 'flash') {
      title = "⚡ Flash Sale Ends In:";
    } else if (originalType === 'medicine') {
      title = "💊 Take Medicine In:";
    } else if (originalType === 'appointment') {
      title = "📅 Doctor Appointment In:";
    }

    return {
      id: "interactive_countdown_demo",
      title,
      body: secondsLeft > 0 
        ? `Remaining time: ${formatTime(secondsLeft)}` 
        : originalType === 'flash' 
          ? "Flash Sale Finished! 🛑" 
          : originalType === 'medicine' 
            ? "Time to take Metformin 500mg! 💊" 
            : "Your Appointment is starting now! 👨‍⚕️",
      android: {
        channelId: "playground_reminders",
        color: secondsLeft > 0 ? "#E2A93E" : "#0F7635",
        onlyAlertOnce: true,
        ongoing: secondsLeft > 0,
      },
    };
  },
};
