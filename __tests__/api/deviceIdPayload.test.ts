/**
 * expo returns null for several device fields on some installs (androidId,
 * iosIdForVendor, brand, osName, buildNumber). identity-service types those as
 * `z.string().min(1).optional()` / `z.string().optional()`, and validateRequest
 * parses with schema.parse(), so a null — or an empty string — 422s the whole
 * request. Login and push registration both depend on getting this right.
 */
import { authApi } from "@/src/features/auth/api/auth.api";
import {
  notificationApi,
  omitNullish,
} from "@/src/features/notifications/api/notification.api";
import { apiClient } from "@/src/api/client";
import type { DeviceInfo } from "@/src/lib/deviceInfo";

jest.mock("@/src/api/client", () => ({
  apiClient: { post: jest.fn(), delete: jest.fn() },
}));

const mockPost = apiClient.post as jest.Mock;

describe("verifyOtp deviceId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({ data: { data: {} } });
  });

  it("sends deviceId when it resolved", async () => {
    await authApi.verifyOtp("+919876543210", "123456", "install-abc");

    expect(mockPost.mock.calls[0][1].deviceId).toBe("install-abc");
  });

  // The regression: "" fails z.string().min(1), which 422s login outright.
  it("omits deviceId entirely when null, never sending an empty string", async () => {
    await authApi.verifyOtp("+919876543210", "123456", null);

    const body = mockPost.mock.calls[0][1];
    expect("deviceId" in body).toBe(false);
    expect(body.deviceId).not.toBe("");
  });

  it("still sends the fields login requires", async () => {
    await authApi.verifyOtp("+919876543210", "123456", null);

    expect(mockPost.mock.calls[0][1]).toMatchObject({
      phone: "+919876543210",
      otp: "123456",
      platform: "APP",
    });
  });
});

describe("omitNullish", () => {
  it("drops null and undefined", () => {
    expect(omitNullish({ a: 1, b: null, c: undefined })).toEqual({ a: 1 });
  });

  // Dropping these would lose real telemetry.
  it("keeps false and 0", () => {
    expect(omitNullish({ is_device: false, level: 0 })).toEqual({
      is_device: false,
      level: 0,
    });
  });

  it("keeps empty strings — only nullish is dropped", () => {
    expect(omitNullish({ a: "" })).toEqual({ a: "" });
  });
});

describe("registerDevice payload", () => {
  const deviceInfo = {
    device_brand: null,
    device_manufacturer: "Samsung",
    device_os_name: null,
    app_build_number: null,
    app_bundle_id: "com.codeneptune.caresure",
    installation_id: null,
    deviceId: null,
    is_device: false,
    platform_api_level: null,
    timezone: "Asia/Kolkata",
    locale: "en-IN",
  } as unknown as DeviceInfo;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({ data: {} });
  });

  it("strips every nullish device field before sending", async () => {
    await notificationApi.registerDevice("fcm-token", deviceInfo);

    const body = mockPost.mock.calls[0][1];
    ["device_brand", "device_os_name", "app_build_number", "installation_id", "deviceId", "platform_api_level"]
      .forEach((key) => expect(key in body).toBe(false));
  });

  it("keeps the token and the fields that did resolve", async () => {
    await notificationApi.registerDevice("fcm-token", deviceInfo);

    expect(mockPost.mock.calls[0][1]).toMatchObject({
      token: "fcm-token",
      device_manufacturer: "Samsung",
      app_bundle_id: "com.codeneptune.caresure",
      is_device: false,
      timezone: "Asia/Kolkata",
    });
  });
});
