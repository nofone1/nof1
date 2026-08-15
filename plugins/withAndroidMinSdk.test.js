const assert = require('node:assert/strict');
const test = require('node:test');
const {
  embedJsInDebugApk,
  pinHostHermesCommand,
} = require('./embed-js-in-debug-apk');

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

test('pins a live hermesCommand and ignores Expo comments', () => {
  const next = pinHostHermesCommand(
    `
react {
    // hermesCommand = "$rootDir/my-custom-hermesc/bin/hermesc"
}
`,
    'linux64-bin'
  );
  assert.match(
    next,
    /^[ \t]*hermesCommand = new File\(rootDir, "\.\.\/node_modules\/react-native\/sdks\/hermesc\/linux64-bin\/hermesc"\)\.absolutePath/m
  );
  assert.match(next, /\/\/ hermesCommand = "\$rootDir\/my-custom-hermesc\/bin\/hermesc"/);
});
