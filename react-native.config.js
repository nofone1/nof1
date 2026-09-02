/**
 * Autolinking overrides for Expo / React Native.
 *
 * Android skip-auth previews drop react-native-purchases-ui because billing
 * is outside the scope of those internal authentication-bypass builds. The
 * iOS app always links RevenueCat UI so production purchases use StoreKit.
 */

/**
 * Build the React Native CLI config used during `expo prebuild` autolinking.
 *
 * @returns {{dependencies: Record<string, {platforms: {android?: null, ios?: null}}|undefined>}}
 *   Android-only autolinking override for internal skip-auth builds.
 */
function createReactNativeConfig() {
  const skipAuth = process.env.EXPO_PUBLIC_SKIP_AUTH === 'true';

  return {
    dependencies: skipAuth
      ? {
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
