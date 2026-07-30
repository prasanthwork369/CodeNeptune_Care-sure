import * as Device from "expo-device";
import { Dimensions, PixelRatio } from "react-native";

const BASE_WIDTH = 390;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const pixelRatio = PixelRatio.get();
const widthRatio = SCREEN_WIDTH / BASE_WIDTH;

// Layout: 360dp → ~92%, 390dp+ → 100% -
const layoutRatio = Math.min(Math.max(widthRatio, 0.92), 1);

// Typography: 360dp → ~92%, 390dp+ → 100%
const typographyRatio = Math.min(Math.max(widthRatio, 0.9), 1);

const snap = (value: number): number =>
  Math.round(value * pixelRatio) / pixelRatio;

export const scale = (size: number): number => {
  "worklet";
  return snap(size * widthRatio);
};

export const exactScale = (size: number): number => {
  "worklet";
  return snap(size * layoutRatio);
};

export const verticalScale = (size: number): number => {
  "worklet";
  return snap(size * layoutRatio);
};

export const moderateScale = (size: number, _factor = 0.5): number => {
  "worklet";
  return snap(size * typographyRatio);
};

if (__DEV__) {
  console.log("[Scalings]", {
    manufacturer: Device.manufacturer,
    model: Device.modelName,
    deviceName: Device.deviceName,
    density: pixelRatio,
    dpWidth: SCREEN_WIDTH,
    dpHeight: SCREEN_HEIGHT,
    physicalPx: `${Math.round(SCREEN_WIDTH * pixelRatio)}x${Math.round(
      SCREEN_HEIGHT * pixelRatio,
    )}`,
    widthRatio: widthRatio.toFixed(3),
    layoutRatio: layoutRatio.toFixed(3),
    typographyRatio: typographyRatio.toFixed(3),
  });
}
