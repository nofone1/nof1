const launchArgsPersistCallback = `
    registerActivityLifecycleCallbacks(object : android.app.Application.ActivityLifecycleCallbacks {
      override fun onActivityCreated(activity: android.app.Activity, savedInstanceState: android.os.Bundle?) {
        LaunchArgsModule.persistFrom(activity.intent)
      }
      override fun onActivityStarted(activity: android.app.Activity) {}
      override fun onActivityResumed(activity: android.app.Activity) {
        LaunchArgsModule.persistFrom(activity.intent)
      }
      override fun onActivityPaused(activity: android.app.Activity) {}
      override fun onActivityStopped(activity: android.app.Activity) {}
      override fun onActivitySaveInstanceState(activity: android.app.Activity, outState: android.os.Bundle) {}
      override fun onActivityDestroyed(activity: android.app.Activity) {}
    })
`;

/**
 * Registers Activity callbacks so launch extras survive a deep-link restart.
 *
 * Android replaces the launch Intent with `nof1://revyl-auth` when Revyl
 * fires the auth-bypass link. Reading only `currentActivity.intent` then
 * drops `REVYL_AUTH_BYPASS_*` and the JS handler rejects the token.
 *
 * Params:
 *   source: `MainApplication.kt` text from prebuild.
 *
 * Returns:
 *   Source that persists extras in `onActivityCreated` / `onActivityResumed`.
 *
 * Throws:
 *   Error when `onCreate` is missing so callbacks cannot be registered.
 */
function registerLaunchArgsPersistence(source) {
  if (source.includes('LaunchArgsModule.persistFrom')) {
    return source;
  }
  if (!/override fun onCreate\(\)/.test(source)) {
    throw new Error(
      'launch-args-module: MainApplication.kt has no onCreate to persist launch extras'
    );
  }
  const next = source.replace(
    /(override fun onCreate\(\) \{[\s\S]*?super\.onCreate\(\)\n)/,
    `$1${launchArgsPersistCallback}`
  );
  if (!next.includes('LaunchArgsModule.persistFrom')) {
    throw new Error(
      'launch-args-module: failed to register launch-extra persistence on MainApplication'
    );
  }
  return next;
}

module.exports = { registerLaunchArgsPersistence };
