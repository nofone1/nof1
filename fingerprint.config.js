/**
 * Align Expo fingerprint with Revyl iOS preview builds.
 *
 * Preview `build_command` / `build.platforms.ios.commands` run
 * `npm uninstall expo-dev-client` before `expo prebuild`, so the uploaded
 * native shell does not include the Expo Development servers picker.
 *
 * Fingerprint runs before those steps. Ignoring the expo-dev-* autolinking
 * graph (and stripping it from expoAutolinkingConfig) makes cache keys match
 * the post-uninstall Release shell, so fingerprint reuse can stay enabled.
 */
const DEV_CLIENT_PACKAGES = new Set([
  'expo-dev-client',
  'expo-dev-launcher',
  'expo-dev-menu',
  'expo-dev-menu-interface',
]);

/** @type {import('@expo/fingerprint').Config} */
const config = {
  concurrentIoLimit: 4,
  ignorePaths: [
    'node_modules/expo-dev-client/**/*',
    'node_modules/expo-dev-launcher/**/*',
    'node_modules/expo-dev-menu/**/*',
    'node_modules/expo-dev-menu-interface/**/*',
  ],
  fileHookTransform: (source, chunk, _isEndOfFile, encoding) => {
    if (
      source.type === 'contents' &&
      source.id === 'expoAutolinkingConfig:ios' &&
      chunk != null
    ) {
      const text = typeof chunk === 'string' ? chunk : chunk.toString(encoding);
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.modules)) {
        parsed.modules = parsed.modules.filter(
          (mod) => !DEV_CLIENT_PACKAGES.has(mod.packageName)
        );
      }
      return JSON.stringify(parsed);
    }
    return chunk;
  },
};

module.exports = config;
