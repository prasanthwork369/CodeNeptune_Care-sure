const { withAndroidColors, withAndroidColorsNight } = require("@expo/config-plugins");

/**
 * expo-image-picker's crop screen renders its "CROP" action invisible in light
 * mode: the activity is declared with `Base.Theme.AppCompat` (always dark) while
 * its colors come from values/ vs values-night/ following the SYSTEM theme. On a
 * light-themed device that means black text on the dark activity.
 *
 * App resources win over library resources during resource merging, so pinning
 * these five to the dark-mode palette in BOTH buckets makes the screen readable
 * whatever the system theme is — matching the activity's fixed dark theme.
 *
 * Remove this once expo-image-picker themes that activity correctly.
 */
const CROP_COLORS = {
  expoCropToolbarColor: "#000000",
  expoCropToolbarIconColor: "#FFFFFF",
  expoCropToolbarActionTextColor: "#FFFFFF",
  expoCropBackButtonIconColor: "#FFFFFF",
  expoCropBackgroundColor: "#000000",
};

/** Upserts our values into a parsed colors.xml resource object. */
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
