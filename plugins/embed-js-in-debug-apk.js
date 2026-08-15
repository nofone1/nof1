const pluginName = 'with-android-min-sdk';

const liveDebuggableVariantsAssignment =
  /^([ \t]*)debuggableVariants\s*=\s*\[[^\]]*\]/m;
const liveEmptyDebuggableVariants = /^[ \t]*debuggableVariants\s*=\s*\[\s*\]/m;
const liveHermesCommandAssignment = /^([ \t]*)hermesCommand\s*=/m;

/**
 * Forces assembleDebug to embed the Metro JS bundle instead of expecting packager.
 *
 * Expo's app/build.gradle only mentions `debuggableVariants` in a comment.
 * Matching that comment and rewriting it leaves the assignment commented out,
 * so Gradle keeps the default `["debug"]` and skips createBundleDebugJsAndAssets.
 *
 * Params:
 *   contents: android/app/build.gradle text from prebuild.
 *
 * Returns:
 *   Gradle text with a live `debuggableVariants = []` inside `react {`.
 *
 * Throws:
 *   Error when there is no `react {` block, or the live assignment is missing
 *   after the rewrite (comment-only matches are ignored).
 */
function embedJsInDebugApk(contents) {
  let next = contents;
  if (liveDebuggableVariantsAssignment.test(contents)) {
    next = contents.replace(
      liveDebuggableVariantsAssignment,
      '$1debuggableVariants = []'
    );
  } else {
    next = contents.replace(
      /(react\s*\{)/,
      '$1\n    debuggableVariants = []'
    );
  }
  if (next === contents && !liveEmptyDebuggableVariants.test(contents)) {
    throw new Error(
      `${pluginName}: android/app/build.gradle has no react { block to embed the debug JS bundle`
    );
  }
  if (!liveEmptyDebuggableVariants.test(next)) {
    throw new Error(
      `${pluginName}: failed to insert a live debuggableVariants = [] (comment-only matches are ignored)`
    );
  }
  return next;
}

/**
 * Returns the Hermes compiler folder shipped for this prebuild host.
 *
 * Params: none (reads process.platform).
 *
 * Returns:
 *   `osx-bin`, `win64-bin`, or `linux64-bin`. linux-arm64 hosts use the
 *   x86_64 linux64-bin (Revyl Android sandbox runs it under qemu/rosetta).
 */
function hermescOsBin() {
  if (process.platform === 'darwin') {
    return 'osx-bin';
  }
  if (process.platform === 'win32') {
    return 'win64-bin';
  }
  return 'linux64-bin';
}

/**
 * Pins a live hermesCommand so createBundleDebugJsAndAssets does not ask the
 * RN gradle plugin to detect the host OS.
 *
 * linux-arm64 throws `OS not recognized` from PathUtils.getHermesOSBin unless
 * hermesCommand is an absolute path without `%OS-BIN%`.
 *
 * Params:
 *   contents: android/app/build.gradle text.
 *   osBin: Optional hermesc folder override for tests.
 *
 * Returns:
 *   Gradle text with a live hermesCommand inside `react {`.
 *
 * Throws:
 *   Error when there is no `react {` block or the live assignment is missing.
 */
function pinHostHermesCommand(contents, osBin = hermescOsBin()) {
  const assignment =
    `hermesCommand = new File(rootDir, "../node_modules/react-native/sdks/hermesc/${osBin}/hermesc").absolutePath`;
  let next = contents;
  if (liveHermesCommandAssignment.test(contents)) {
    next = contents.replace(liveHermesCommandAssignment, `$1${assignment}`);
  } else {
    next = contents.replace(/(react\s*\{)/, `$1\n    ${assignment}`);
  }
  if (!/^[ \t]*hermesCommand\s*=/m.test(next)) {
    throw new Error(
      `${pluginName}: failed to insert a live hermesCommand (comment-only matches are ignored)`
    );
  }
  return next;
}

module.exports = { embedJsInDebugApk, hermescOsBin, pinHostHermesCommand };
