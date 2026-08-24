const {
  createRunOncePlugin,
  withGradleProperties,
  withProjectBuildGradle,
} = require('@expo/config-plugins');

const pluginName = 'with-android-min-sdk';

function setGradleProperty(properties, key, value) {
  const existing = properties.find((item) => item.type === 'property' && item.key === key);
  if (existing) {
    existing.value = value;
    return properties;
  }
  properties.push({ type: 'property', key, value });
  return properties;
}

function replaceNdkVersion(contents, ndkVersion) {
  const next = contents.replace(/ndkVersion\s*=\s*.+/g, `ndkVersion = "${ndkVersion}"`);
  if (next === contents) {
    throw new Error(
      `${pluginName}: android/build.gradle has no ndkVersion assignment to set ${ndkVersion}`
    );
  }
  return next;
}

function replaceAgpClasspath(contents, agpVersion) {
  const versioned = contents.replace(
    /classpath\(['"]com\.android\.tools\.build:gradle:[^'"]+['"]\)/g,
    `classpath('com.android.tools.build:gradle:${agpVersion}')`
  );
  if (versioned !== contents) {
    return versioned;
  }
  return contents.replace(
    /classpath\(['"]com\.android\.tools\.build:gradle['"]\)/g,
    `classpath('com.android.tools.build:gradle:${agpVersion}')`
  );
}

function withAndroidMinSdk(config, props) {
  const minSdkVersion = String((props && props.minSdkVersion) || 28);
  const architectures = String((props && props.architectures) || 'x86_64');
  const ndkVersion = String((props && props.ndkVersion) || '27.1.12297006');
  const agpVersion = String((props && props.agpVersion) || '8.7.2');
  const newArchEnabled =
    props && Object.prototype.hasOwnProperty.call(props, 'newArchEnabled')
      ? String(props.newArchEnabled)
      : 'false';

  config = withGradleProperties(config, (modConfig) => {
    modConfig.modResults = setGradleProperty(
      modConfig.modResults,
      'android.minSdkVersion',
      minSdkVersion
    );
    modConfig.modResults = setGradleProperty(
      modConfig.modResults,
      'reactNativeArchitectures',
      architectures
    );
    modConfig.modResults = setGradleProperty(
      modConfig.modResults,
      'android.ndkVersion',
      ndkVersion
    );
    modConfig.modResults = setGradleProperty(
      modConfig.modResults,
      'newArchEnabled',
      newArchEnabled
    );
    modConfig.modResults = setGradleProperty(
      modConfig.modResults,
      'android.native.buildOutput',
      'verbose'
    );
    return modConfig;
  });

  return withProjectBuildGradle(config, (modConfig) => {
    modConfig.modResults.contents = replaceAgpClasspath(
      replaceNdkVersion(modConfig.modResults.contents, ndkVersion),
      agpVersion
    );
    return modConfig;
  });
}

module.exports = createRunOncePlugin(withAndroidMinSdk, pluginName, '1.0.0');
