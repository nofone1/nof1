/**
 * Autolinking overrides for Expo / React Native.
 *
 * Revyl preview and skip-auth builds set EXPO_PUBLIC_SKIP_AUTH=true. Those
 * Release binaries must not link expo-dev-client, or they open the Expo
 * "Development servers" picker. Local `expo start` / `revyl dev` leave the
 * env unset so the dev client still links.
 */

/**
 * Build the React Native CLI config used during `expo prebuild` autolinking.
 *
 * @returns {{dependencies: Record<string, {platforms: {ios: null, android: null}}|undefined>}}
 *   Autolinking overrides. `expo-dev-client` is unlinked when
 *   EXPO_PUBLIC_SKIP_AUTH=true; otherwise no overrides are applied.
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
        }
      : {},
  };
}

module.exports = createReactNativeConfig();
