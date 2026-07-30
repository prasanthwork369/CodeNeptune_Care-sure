const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Explicit alias resolution for @/ → project root
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@": path.resolve(__dirname),
  "crypto-js/sha1": path.resolve(__dirname, "node_modules/crypto-js/sha1.js"),
};

// SVG Component support
// Requires: npx expo install react-native-svg react-native-svg-transformer
try {
  const { transformer, resolver } = config;
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg", "mjs"],
  };
} catch (_) {
  console.warn(
    "\n[metro.config] react-native-svg-transformer not found.\n" +
      "SVG component imports will not work until you run:\n" +
      "  npx expo install react-native-svg react-native-svg-transformer\n",
  );
}

config.resolver.assetExts.push("lottie");

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ["react-native", "browser", "import"];

const defaultGetModulesRunBeforeMainModule =
  config.serializer?.getModulesRunBeforeMainModule;
config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: (entryPoint) => {
    const defaultModules =
      typeof defaultGetModulesRunBeforeMainModule === "function"
        ? defaultGetModulesRunBeforeMainModule(entryPoint)
        : [];
    return [
      ...defaultModules,
      require.resolve("./src/utils/patchText.ts"),
      require.resolve("./src/utils/patchTextInput.ts"),
    ];
  },
};

const PATCH_TEXT_PATH = path.resolve(__dirname, "src/utils/patchText.ts");
// Matches node_modules/react-native/Libraries/Text/Text.js regardless of how it was required
// (deep import like 'react-native/Libraries/Text/Text', or the relative require inside
// react-native's own index.js, e.g. require('./Libraries/Text/Text')).
const RN_TEXT_FILE = /[\\/]react-native[\\/]Libraries[\\/]Text[\\/]Text\.js$/;

// Same treatment for TextInput so plain <TextInput> is patched app-wide too
// (the runtime monkey-patch alone doesn't reliably reach every import).
const PATCH_TEXTINPUT_PATH = path.resolve(
  __dirname,
  "src/utils/patchTextInput.ts",
);
const RN_TEXTINPUT_FILE =
  /[\\/]react-native[\\/]Libraries[\\/]Components[\\/]TextInput[\\/]TextInput\.js$/;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // If the request is coming from our patch utility itself, do NOT redirect it!
  // This breaks the loop when the utility imports the original Text component.
  // Normalize to forward slashes first -- on Windows originModulePath uses backslashes,
  // which would silently never match a forward-slash literal.
  const origin = context.originModulePath
    ? context.originModulePath.replace(/\\/g, "/")
    : "";
  if (origin.includes("src/utils/patchText")) {
    return context.resolveRequest(context, moduleName, platform);
  }

  const result = context.resolveRequest(context, moduleName, platform);

  // Redirect any resolution that lands on react-native's Text.js directly to our patch file,
  // no matter whether the original request was a deep absolute import or a relative require.
  if (result.type === "sourceFile" && RN_TEXT_FILE.test(result.filePath)) {
    return context.resolveRequest(context, PATCH_TEXT_PATH, platform);
  }

  // Same redirect for TextInput.js → our TextInput patch.
  if (result.type === "sourceFile" && RN_TEXTINPUT_FILE.test(result.filePath)) {
    return context.resolveRequest(context, PATCH_TEXTINPUT_PATH, platform);
  }

  return result;
};

module.exports = withNativeWind(config, { input: "./global.css" });
