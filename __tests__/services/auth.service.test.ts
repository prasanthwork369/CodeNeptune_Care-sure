import { authService } from "@/src/services/auth.service";
import { authApi } from "@/src/api/auth.api";
import { profileApi } from "@/src/api/profile.api";
import { useAuthStore } from "@/src/store/authStore";
import { messagingService as notificationService } from "@/src/services/firebase";

jest.mock("@/src/api/auth.api", () => ({
  authApi: {
    requestOtp: jest.fn(),
    verifyOtp: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock("@/src/api/profile.api", () => ({
  profileApi: {
    getProfile: jest.fn(),
    deleteAccount: jest.fn(),
  },
}));

jest.mock("@/src/lib/deviceInfo", () => ({
  getDeviceInfo: jest.fn().mockResolvedValue({ deviceId: "device-uuid-123" }),
}));

jest.mock("@/src/services/firebase", () => ({
  messagingService: {
    unregister: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("authService — Authentication Lifecycle Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requestOtp forwards call to authApi", async () => {
    (authApi.requestOtp as jest.Mock).mockResolvedValueOnce({ success: true });

    const result = await authService.requestOtp("9876543210");
    expect(authApi.requestOtp).toHaveBeenCalledWith("9876543210");
    expect(result).toEqual({ success: true });
  });

  it("verifyOtp includes deviceId, logs user in, and fetches profile", async () => {
    (authApi.verifyOtp as jest.Mock).mockResolvedValueOnce({
      data: {
        accessToken: "access-123",
        refreshToken: "refresh-456",
        expiresIn: 3600,
      },
    });
    (profileApi.getProfile as jest.Mock).mockResolvedValueOnce({
      id: "u-101",
      firstName: "Jane",
    });

    const loginSpy = jest
      .spyOn(useAuthStore.getState(), "login")
      .mockResolvedValueOnce(undefined);
    const setUserSpy = jest.spyOn(useAuthStore.getState(), "setUser");

    await authService.verifyOtp("9876543210", "123456");

    expect(authApi.verifyOtp).toHaveBeenCalledWith(
      "9876543210",
      "123456",
      "device-uuid-123",
    );
    expect(loginSpy).toHaveBeenCalledWith("access-123", 3600);
    expect(profileApi.getProfile).toHaveBeenCalled();
    expect(setUserSpy).toHaveBeenCalledWith({ id: "u-101", firstName: "Jane" });
  });

  it("logout calls authApi.logout and notificationService.unregister before clearing local auth state", async () => {
    const logoutStoreSpy = jest
      .spyOn(useAuthStore.getState(), "logout")
      .mockResolvedValueOnce(undefined);

    await authService.logout();

    expect(authApi.logout).toHaveBeenCalled();
    expect(notificationService.unregister).toHaveBeenCalled();
    expect(logoutStoreSpy).toHaveBeenCalled();
  });

  it("deleteAccount clears auth state only when server deletion succeeds", async () => {
    (profileApi.deleteAccount as jest.Mock).mockResolvedValueOnce({
      success: true,
    });
    const logoutStoreSpy = jest
      .spyOn(useAuthStore.getState(), "logout")
      .mockResolvedValueOnce(undefined);

    const res = await authService.deleteAccount("No longer needed");

    expect(profileApi.deleteAccount).toHaveBeenCalledWith("No longer needed");
    expect(notificationService.unregister).toHaveBeenCalled();
    expect(logoutStoreSpy).toHaveBeenCalled();
    expect(res).toEqual({ success: true });
  });
});
