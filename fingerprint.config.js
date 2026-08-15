/**
 * Align Expo fingerprint with Revyl iOS and Android preview builds.
 *
 * Preview `build_command` / `build.platforms.*.commands` run
 * `npm uninstall expo-dev-client` before `expo prebuild`, so the uploaded
 * native shell does not include the Expo Development servers picker.
 *
 * Fingerprint runs before those steps. Ignoring the expo-dev-* autolinking
 * graph (and stripping it from expoAutolinkingConfig) makes cache keys match
 * the post-uninstall shell, so fingerprint reuse can stay enabled.
 *
 * `extra.dogfoodMarker` is a JS-only dogfood stamp. Stripping it keeps
 * native reuse across R-bumps that do not change native code.
 */
const DEV_CLIENT_PACKAGES = new Set([
  'expo-dev-client',
  'expo-dev-launcher',
  'expo-dev-menu',
  'expo-dev-menu-interface',
]);

const AUTOLINKING_SOURCE_IDS = new Set([
  'expoAutolinkingConfig:ios',
  'expoAutolinkingConfig:android',
]);

/**
 * Returns true when this fingerprint source is Expo autolinking JSON.
 *
 * Params:
 *   source: `@expo/fingerprint` file-hook source.
 *
 * Returns:
 *   Whether the chunk is iOS or Android autolinking contents.
 */
function isAutolinkingSource(source) {
  return source.type === 'contents' && AUTOLINKING_SOURCE_IDS.has(source.id);
}

/**
 * Returns true when this fingerprint source is the Expo app config.
 *
 * Params:
 *   source: `@expo/fingerprint` file-hook source.
 *
 * Returns:
 *   Whether the chunk is `expoConfig` contents or `app.json`.
 */
function isExpoConfigSource(source) {
  if (source.type === 'contents' && source.id === 'expoConfig') {
    return true;
  }
  const filePath = String(source.filePath || source.id || '');
  return source.type === 'file' && /(^|\/)app\.json$/.test(filePath);
}

/**
 * Removes expo-dev-* modules from an autolinking JSON payload.
 *
 * Params:
 *   text: Serialized Expo autolinking config.
 *
 * Returns:
 *   JSON whose `modules` list excludes the uninstalled dev-client packages.
 *
 * Throws:
 *   SyntaxError when `text` is not JSON.
 */
function stripDevClientAutolinking(text) {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed.modules)) {
    parsed.modules = parsed.modules.filter(
      (mod) => !DEV_CLIENT_PACKAGES.has(mod.packageName)
    );
  }
  return JSON.stringify(parsed);
}

/**
 * Removes the JS-only dogfood marker from serialized Expo config.
 *
 * Params:
 *   text: Serialized `app.json` or `expoConfig` contents.
 *
 * Returns:
 *   JSON without `extra.dogfoodMarker`. Unchanged when that key is absent.
 *
 * Throws:
 *   SyntaxError when `text` is not JSON.
 */
function stripDogfoodMarker(text) {
  const parsed = JSON.parse(text);
  const expo = parsed.expo && typeof parsed.expo === 'object' ? parsed.expo : parsed;
  if (expo.extra && Object.prototype.hasOwnProperty.call(expo.extra, 'dogfoodMarker')) {
    const extra = { ...expo.extra };
    delete extra.dogfoodMarker;
    expo.extra = extra;
  }
  return JSON.stringify(parsed);
}

/**
 * Rewrites one fingerprint chunk so preview uninstalls and marker bumps
 * do not change the native hash.
 *
 * Params:
 *   source: `@expo/fingerprint` file-hook source.
 *   chunk: File or contents chunk, or null at end-of-file.
 *   encoding: Text encoding when `chunk` is a Buffer.
 *
 * Returns:
 *   Transformed chunk, or the original chunk when the source is unrelated.
 *
 * Throws:
 *   SyntaxError when a matched source is not JSON.
 */
function transformFingerprintChunk(source, chunk, encoding) {
  if (chunk == null) {
    return chunk;
  }
  const text = typeof chunk === 'string' ? chunk : chunk.toString(encoding);
  if (isAutolinkingSource(source)) {
    return stripDevClientAutolinking(text);
  }
  if (isExpoConfigSource(source)) {
    return stripDogfoodMarker(text);
  }
  return chunk;
}

/** @type {import('@expo/fingerprint').Config} */
const config = {
  concurrentIoLimit: 4,
  ignorePaths: [
    'node_modules/expo-dev-client/**/*',
    'node_modules/expo-dev-launcher/**/*',
    'node_modules/expo-dev-menu/**/*',
    'node_modules/expo-dev-menu-interface/**/*',
  ],
  fileHookTransform: (source, chunk, _isEndOfFile, encoding) =>
    transformFingerprintChunk(source, chunk, encoding),
};

module.exports = config;
module.exports.stripDevClientAutolinking = stripDevClientAutolinking;
module.exports.stripDogfoodMarker = stripDogfoodMarker;
module.exports.transformFingerprintChunk = transformFingerprintChunk;
