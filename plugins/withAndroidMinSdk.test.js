const assert = require('node:assert/strict');
const test = require('node:test');
const {
  disableDebugPackager,
  embedJsInDebugApk,
  pinHostHermesCommand,
} = require('./embed-js-in-debug-apk');
const {
  registerLaunchArgsPersistence,
} = require('./launch-args-persist');

const expoCommentedTemplate = `
react {
    /* Variants */
    // The list of variants to that are debuggable. For those we're going to
    // skip the bundling of the JS bundle and the assets. By default is just 'debug'.
    // If you add flavors like lite, prod, etc. you'll have to list your debuggableVariants.
    // debuggableVariants = ["liteDebug", "prodDebug"]
}
`;

test('inserts a live assignment when Expo only comments debuggableVariants', () => {
  const next = embedJsInDebugApk(expoCommentedTemplate);
  assert.match(next, /^[ \t]*debuggableVariants = \[\]/m);
  assert.match(next, /\/\/ debuggableVariants = \["liteDebug", "prodDebug"\]/);
});

test('rewrites an existing live assignment and ignores comments', () => {
  const next = embedJsInDebugApk(`
react {
    debuggableVariants = ["debug"]
    // debuggableVariants = ["liteDebug", "prodDebug"]
}
`);
  assert.match(next, /^[ \t]*debuggableVariants = \[\]/m);
  assert.doesNotMatch(next, /^[ \t]*debuggableVariants = \["debug"\]/m);
});

test('throws when there is no react block', () => {
  assert.throws(
    () => embedJsInDebugApk('android { namespace "com.nof1.experiments" }'),
    /no react \{ block/
  );
});

test('replaces %OS-BIN% on Expo live hermesCommand and ignores comments', () => {
  const next = pinHostHermesCommand(
    `
react {
    // hermesCommand = "$rootDir/my-custom-hermesc/bin/hermesc"
    hermesCommand = new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim()).getParentFile().getAbsolutePath() + "/sdks/hermesc/%OS-BIN%/hermesc"
}
`,
    'linux64-bin'
  );
  assert.match(next, /sdks\/hermesc\/linux64-bin\/hermesc/);
  assert.doesNotMatch(next, /^[ \t]*hermesCommand\s*=.*%OS-BIN%/m);
  assert.match(next, /\/\/ hermesCommand = "\$rootDir\/my-custom-hermesc\/bin\/hermesc"/);
});

test('does not glue a new assignment onto an existing hermesCommand line', () => {
  const next = pinHostHermesCommand(
    `
react {
    hermesCommand = new File(["node"].execute(null, rootDir).text.trim()).getParentFile().getAbsolutePath() + "/sdks/hermesc/%OS-BIN%/hermesc"
}
`,
    'linux64-bin'
  );
  assert.doesNotMatch(next, /absolutePath\s+new File/);
  assert.doesNotMatch(next, /\.absolutePath\(/);
});

test('disables Expo getUseDeveloperSupport so debug APKs skip Metro', () => {
  const next = disableDebugPackager(`
class MainApplication : Application(), ReactApplication {
  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
        this,
        object : DefaultReactNativeHost(this) {
          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
      }
  )
}
`);
  assert.match(next, /override fun getUseDeveloperSupport\(\): Boolean = false/);
  assert.doesNotMatch(next, /getUseDeveloperSupport\(\).*= BuildConfig\.DEBUG/);
});

test('throws when MainApplication has no getUseDeveloperSupport', () => {
  assert.throws(
    () => disableDebugPackager('class MainApplication : Application()'),
    /failed to disable getUseDeveloperSupport/
  );
});

test('registers launch-extra persistence after super.onCreate', () => {
  const next = registerLaunchArgsPersistence(`
class MainApplication : Application(), ReactApplication {
  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
  }
}
`);
  assert.match(next, /super\.onCreate\(\)\n\s+registerActivityLifecycleCallbacks/);
  assert.match(next, /LaunchArgsModule\.persistFrom\(activity\.intent\)/);
});

test('is idempotent when launch-extra persistence is already registered', () => {
  const once = registerLaunchArgsPersistence(`
class MainApplication : Application(), ReactApplication {
  override fun onCreate() {
    super.onCreate()
    LaunchArgsModule.persistFrom(activity.intent)
  }
}
`);
  const twice = registerLaunchArgsPersistence(once);
  assert.equal(twice, once);
});
