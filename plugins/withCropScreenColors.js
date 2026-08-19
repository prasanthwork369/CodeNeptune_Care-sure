const {
  withAndroidColors,
  withAndroidColorsNight,
} = require("expo/config-plugins");

/** Fixes invisible "CROP" action on expo-image-picker crop screen in light mode by pinning toolbar colors to dark-mode. */
const CROP_COLORS = {
  expoCropToolbarColor: "#000000",
  expoCropToolbarIconColor: "#FFFFFF",
  expoCropToolbarActionTextColor: "#FFFFFF",
  expoCropBackButtonIconColor: "#FFFFFF",
  expoCropBackgroundColor: "#000000",
};

/** Upserts custom colors into resource object */
const applyColors = (colors) => {
  colors.resources = colors.resources ?? {};
  colors.resources.color = colors.resources.color ?? [];

  for (const [name, value] of Object.entries(CROP_COLORS)) {
    const existing = colors.resources.color.find((c) => c.$?.name === name);
    if (existing) {
      existing._ = value;
    } else {
      colors.resources.color.push({ $: { name }, _: value });
    }
  }

  return colors;
};

module.exports = function withCropScreenColors(config) {
  const withDay = withAndroidColors(config, (cfg) => {
    cfg.modResults = applyColors(cfg.modResults);
    return cfg;
  });

  return withAndroidColorsNight(withDay, (cfg) => {
    cfg.modResults = applyColors(cfg.modResults);
    return cfg;
  });
};
