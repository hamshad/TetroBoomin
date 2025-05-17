const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Base configuration
const baseConfig = mergeConfig(getDefaultConfig(__dirname), {
  /* your custom Metro configuration */
});

// Combine both reanimated and nativewind configurations
const configWithNativeWind = withNativeWind(baseConfig, {
  input: './global.css',
});
const finalConfig = wrapWithReanimatedMetroConfig(configWithNativeWind);

module.exports = finalConfig;
