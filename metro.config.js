const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Explicit alias resolution for @/ → project root
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    '@': path.resolve(__dirname),
    'crypto-js/sha1': path.resolve(__dirname, 'node_modules/crypto-js/sha1.js'),
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
        '\n[metro.config] react-native-svg-transformer not found.\n' +
        'SVG component imports will not work until you run:\n' +
        '  npx expo install react-native-svg react-native-svg-transformer\n'
    );
}

config.resolver.assetExts.push('lottie');

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'browser', 'import'];

module.exports = withNativeWind(config, { input: './global.css' });