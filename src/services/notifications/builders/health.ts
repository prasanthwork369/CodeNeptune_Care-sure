const getNotifee = () => require("@notifee/react-native");

export const healthBuilders = {
  buildMedicineReminder: () => {
    const { AndroidCategory } = getNotifee();
    return {
      title: "Medicine Time 💊",
      body: "Time to take Metformin 500mg (1 Tablet after lunch).",
      android: {
        channelId: "playground_reminders",
        category: AndroidCategory.REMINDER,
        color: "#0F7635",
      },
    };
  },
  buildPrescriptionApproved: () => ({
    title: "Prescription Approved ✅",
    body: "Your prescription has been approved by our partner physician. Click to proceed to checkout.",
    android: {
      channelId: "playground_basic",
      color: "#0F7635",
    },
  }),
  buildPrescriptionRejected: () => ({
    title: "Prescription Rejected ❌",
    body: "We couldn't verify your prescription because the image was blurry. Please upload a clear photo.",
    android: {
      channelId: "playground_basic",
      color: "#CA2B25",
    },
  }),
  buildHealthCheckReminder: () => ({
    title: "Upcoming Health Checkup 🩺",
    body: "Reminder: Your Complete Hemogram test is scheduled tomorrow at 8:00 AM.",
    android: {
      channelId: "playground_reminders",
    },
  }),
  buildDoctorAppointmentReminder: () => ({
    title: "Doctor Appointment Soon 👨‍⚕️",
    body: "Your video consult with Dr. Verma starts in 15 minutes. Join now.",
    android: {
      channelId: "playground_reminders",
      color: "#0F7635",
    },
  }),
  buildRefillReminder: () => ({
    title: "Refill Due 🗓️",
    body: "Your 30-day supply of Lipitor is running out in 3 days. Order a refill now to avoid interruption.",
    android: {
      channelId: "playground_reminders",
    },
  }),
};
