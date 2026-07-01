import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

export type DeviceInfo = {
  // Device hardware
  device_name: string | null;
  device_model: string | null;
  device_brand: string | null;
  device_manufacturer: string | null;
  device_os: "ios" | "android" | "web";
  device_os_name: string | null;
  device_os_version: string | null;
  device_type: "UNKNOWN" | "PHONE" | "TABLET" | "DESKTOP" | "TV";
  platform_api_level: number | null;
  is_device: boolean;

  // App
  app_version: string | null;
  app_build_number: string | null;
  app_bundle_id: string | null;
  app_env: "production" | "development";

  // Install identifier
  installation_id: string | null;

  // Locale / timezone (via built-in Intl — no expo-localization needed)
  timezone: string;
  locale: string;
};

const DEVICE_TYPE_MAP: Record<number, DeviceInfo["device_type"]> = {
  [Device.DeviceType.UNKNOWN]: "UNKNOWN",
  [Device.DeviceType.PHONE]: "PHONE",
  [Device.DeviceType.TABLET]: "TABLET",
  [Device.DeviceType.DESKTOP]: "DESKTOP",
  [Device.DeviceType.TV]: "TV",
};

async function getInstallationId(): Promise<string | null> {
  try {
    if (Platform.OS === "ios") {
      return await Application.getIosIdForVendorAsync();
    }
    return Application.getAndroidId();
  } catch {
    return Constants.sessionId ?? null;
  }
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  const installationId = await getInstallationId();

  return {
    device_name: Device.deviceName,
    device_model: Device.modelName,
    device_brand: Device.brand,
    device_manufacturer: Device.manufacturer,
    device_os: Platform.OS as DeviceInfo["device_os"],
    device_os_name: Device.osName,
    device_os_version: Device.osVersion,
    device_type: DEVICE_TYPE_MAP[Device.deviceType ?? Device.DeviceType.UNKNOWN] ?? "UNKNOWN",
    platform_api_level: Device.platformApiLevel,
    is_device: Device.isDevice,

    app_version: Application.nativeApplicationVersion,
    app_build_number: Application.nativeBuildVersion,
    app_bundle_id: Application.applicationId,
    app_env: __DEV__ ? "development" : "production",

    installation_id: installationId,

    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
  };
}
