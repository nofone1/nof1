/**
 * Autolinking overrides for Expo / React Native.
 *
 * Revyl preview and skip-auth builds set EXPO_PUBLIC_SKIP_AUTH=true. Those
 * Release binaries must not link expo-dev-client, or they open the Expo
 * "Development servers" picker. Local `expo start` / `revyl dev` leave the
 * env unset so the dev client still links.
 *
 * Android skip-auth previews also drop react-native-purchases-ui: that
 * package needs Kotlin 2.1, which Expo 52 cannot compile.
 */

/**
 * Build the React Native CLI config used during `expo prebuild` autolinking.
 *
 * @returns {{dependencies: Record<string, {platforms: {android?: null, ios?: null}}|undefined>}}
 *   Autolinking overrides applied when EXPO_PUBLIC_SKIP_AUTH=true.
 */
function createReactNativeConfig() {
  const stripDevClient = process.env.EXPO_PUBLIC_SKIP_AUTH === 'true';

  return {
    dependencies: stripDevClient
      ? {
          'expo-dev-client': {
            platforms: {
              ios: null,
              android: null,
            },
          },
          'react-native-purchases-ui': {
            platforms: {
              android: null,
            },
          },
        }
      : {},
  };
}

module.exports = createReactNativeConfig();
