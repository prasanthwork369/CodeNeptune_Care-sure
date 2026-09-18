import AsyncStorage from "@react-native-async-storage/async-storage";
import { notificationService } from "@/src/services/firebase/messaging/messaging.service";
import { notificationApi } from "@/src/features/notifications/api/notification.api";

jest.mock("@/src/features/notifications/api/notification.api", () => ({
  notificationApi: {
    registerDevice: jest.fn().mockResolvedValue({ success: true }),
    removeToken: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock("@/src/utils/environment", () => ({
  isExpoGo: false,
}));

describe("notificationService.unregister — Token & Cache Cleanup", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it("calls notificationApi.removeToken and purges the local AsyncStorage registration cache", async () => {
    await AsyncStorage.setItem(
      "caresure.push_token.registration",
      "mock-fcm-token:true",
    );

    await notificationService.unregister();

    expect(notificationApi.removeToken).toHaveBeenCalled();
    const cached = await AsyncStorage.getItem("caresure.push_token.registration");
    expect(cached).toBeNull();
  });

  it("purges the local AsyncStorage registration cache even when backend removeToken fails (e.g. 401 / network offline)", async () => {
    (notificationApi.removeToken as jest.Mock).mockRejectedValueOnce(
      new Error("401 Unauthorized — token expired"),
    );

    await AsyncStorage.setItem(
      "caresure.push_token.registration",
      "mock-fcm-token:true",
    );

    // Unregister should not throw
    await expect(notificationService.unregister()).resolves.not.toThrow();

    expect(notificationApi.removeToken).toHaveBeenCalled();
    const cached = await AsyncStorage.getItem("caresure.push_token.registration");
    expect(cached).toBeNull();
  });
});
