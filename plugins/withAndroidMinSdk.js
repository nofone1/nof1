const { createRunOncePlugin, withGradleProperties } = require('@expo/config-plugins');

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

function withAndroidMinSdk(config, props) {
  const minSdkVersion = String((props && props.minSdkVersion) || 28);
  const architectures = String((props && props.architectures) || 'x86_64');
  const ndkVersion = String((props && props.ndkVersion) || '27.1.12297006');
  const newArchEnabled =
    props && Object.prototype.hasOwnProperty.call(props, 'newArchEnabled')
      ? String(props.newArchEnabled)
      : 'false';

  return withGradleProperties(config, (modConfig) => {
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
    return modConfig;
  });
}

module.exports = createRunOncePlugin(withAndroidMinSdk, pluginName, '1.0.0');
