export const commerceBuilders = {
  buildOrderConfirmed: () => ({
    title: "Order Confirmed 🎉",
    body: "Your order #CS-8941 has been confirmed. Tap to track progress.",
    android: {
      channelId: "playground_basic",
      color: "#0F7635",
    },
  }),
  buildOrderPacked: () => ({
    title: "Order Packed 📦",
    body: "Your health package #CS-8941 is packed and ready for dispatch.",
    android: {
      channelId: "playground_basic",
    },
  }),
  buildOutForDelivery: () => ({
    title: "Out for Delivery 🛵",
    body: "Ramesh is out for delivery with your CareSure package. Contact: +91 98765 43210",
    android: {
      channelId: "playground_basic",
    },
  }),
  buildDelivered: () => ({
    title: "Delivered Successfully ✅",
    body: "Your order #CS-8941 has been delivered to your doorstep.",
    android: {
      channelId: "playground_basic",
      color: "#0F7635",
    },
  }),
  buildPaymentSuccess: () => ({
    title: "Payment Received 💳",
    body: "Payment of ₹1,250.00 for order #CS-8941 was successful.",
    android: {
      channelId: "playground_basic",
      color: "#0F7635",
    },
  }),
  buildPaymentFailed: () => ({
    title: "Payment Failed ❌",
    body: "Your transaction for ₹1,250.00 failed. Tap to update payment details.",
    android: {
      channelId: "playground_basic",
      color: "#CA2B25",
    },
  }),
  buildRefundProcessed: () => ({
    title: "Refund Processed 🔄",
    body: "Refund of ₹450.00 has been processed to your bank account.",
    android: {
      channelId: "playground_basic",
    },
  }),
  buildInvoiceDownloaded: () => ({
    title: "Invoice Saved 📄",
    body: "Invoice for order #CS-8941 has been saved to your files.",
    android: {
      channelId: "playground_progress",
    },
  }),
  buildDownloadCompleted: () => ({
    title: "Download Completed ⬇️",
    body: "Your lab report (report_4819.pdf) is downloaded.",
    android: {
      channelId: "playground_progress",
    },
  }),
};
