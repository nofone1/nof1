const pluginName = 'with-android-min-sdk';

const liveDebuggableVariantsAssignment =
  /^([ \t]*)debuggableVariants\s*=\s*\[[^\]]*\]/m;
const liveEmptyDebuggableVariants = /^[ \t]*debuggableVariants\s*=\s*\[\s*\]/m;

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

module.exports = { embedJsInDebugApk };
