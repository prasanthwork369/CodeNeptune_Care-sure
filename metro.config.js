const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Resolve alias @/ to project root
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@": path.resolve(__dirname),
  "crypto-js/sha1": path.resolve(__dirname, "node_modules/crypto-js/sha1.js"),
};

// Support SVG component imports
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
// Match React Native's Text component source file
const RN_TEXT_FILE = /[\\/]react-native[\\/]Libraries[\\/]Text[\\/]Text\.js$/;

// Match React Native's TextInput component source file
const PATCH_TEXTINPUT_PATH = path.resolve(
  __dirname,
  "src/utils/patchTextInput.ts",
);
const RN_TEXTINPUT_FILE =
  /[\\/]react-native[\\/]Libraries[\\/]Components[\\/]TextInput[\\/]TextInput\.js$/;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Avoid recursive resolver loops when patch files import React Native components
  const origin = context.originModulePath
    ? context.originModulePath.replace(/\\/g, "/")
    : "";
  if (origin.includes("src/utils/patchText")) {
    return context.resolveRequest(context, moduleName, platform);
  }

  const result = context.resolveRequest(context, moduleName, platform);

  // Redirect Text imports to our patch file
  if (result.type === "sourceFile" && RN_TEXT_FILE.test(result.filePath)) {
    return context.resolveRequest(context, PATCH_TEXT_PATH, platform);
  }

  // Redirect TextInput imports to our patch file
  if (result.type === "sourceFile" && RN_TEXTINPUT_FILE.test(result.filePath)) {
    return context.resolveRequest(context, PATCH_TEXTINPUT_PATH, platform);
  }

  return result;
};

module.exports = withNativeWind(config, { input: "./global.css" });
