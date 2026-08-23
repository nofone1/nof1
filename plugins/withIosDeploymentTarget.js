const {
  createRunOncePlugin,
  withPodfile,
  withPodfileProperties,
  withXcodeProject,
} = require('@expo/config-plugins');

const pluginName = 'with-ios-deployment-target';

const FMT_CXX17_MARKER = "CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'";
const FMT_CXX17_BLOCK = [
  '',
  '    # Xcode 26+: fmt 11.0.2 consteval breaks under newer Apple Clang.',
  '    # C++17 disables consteval for this pod only (RN still uses C++20).',
  '    installer.pods_project.targets.each do |target|',
  "      next unless target.name == 'fmt'",
  '      target.build_configurations.each do |config|',
  "        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'",
  '      end',
  '    end',
  '',
].join('\n');

/**
 * Insert the fmt C++17 workaround into an Expo-generated Podfile.
 *
 * @param {string} contents Current Podfile text.
 * @returns {string} Podfile text with the fmt patch applied when missing.
 */
function applyFmtXcode26Patch(contents) {
  if (contents.includes(FMT_CXX17_MARKER)) {
    return contents;
  }

  const match = contents.match(/react_native_post_install\([\s\S]*?\)\n/);
  if (match && match.index !== undefined) {
    const end = match.index + match[0].length;
    return contents.slice(0, end) + FMT_CXX17_BLOCK + contents.slice(end);
  }

  return contents;
}

/**
 * Pin the iOS deployment target and apply Xcode 26 fmt workarounds during prebuild.
 *
 * @param {import('@expo/config-plugins').ExportedConfig} config Expo config.
 * @param {{target?: string}|undefined} props Optional plugin props.
 * @returns {import('@expo/config-plugins').ExportedConfig} Updated Expo config.
 */
function withIosDeploymentTarget(config, props) {
  const deploymentTarget = (props && props.target) || '18.5';
  const podfileDeploymentTargetPattern =
    /build_settings\[['"]IPHONEOS_DEPLOYMENT_TARGET['"]\]\s*=\s*['"][^'"]*['"]/g;

  config = withPodfile(config, (modConfig) => {
    const targetPattern = /^\s*platform\s+:ios,\s*.*$/m;
    const iosDeploymentTargetLine = `platform :ios, '${deploymentTarget}'`;
    const podsDeploymentTargetBlock = [
      '',
      '  installer.pods_project.build_configurations.each do |config|',
      `    config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${deploymentTarget}'`,
      '  end',
      '',
    ].join('\n');

    const hasDeploymentTargetOverride = podfileDeploymentTargetPattern.test(
      modConfig.modResults.contents
    );

    modConfig.modResults.contents = modConfig.modResults.contents
      .replace(targetPattern, iosDeploymentTargetLine)
      .replace(
        podfileDeploymentTargetPattern,
        `      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${deploymentTarget}'`
      );

    if (hasDeploymentTargetOverride) {
      modConfig.modResults.contents = applyFmtXcode26Patch(
        modConfig.modResults.contents
      );
      return modConfig;
    }

    const lines = modConfig.modResults.contents.split('\n');
    const postInstallStartIndex = lines.findIndex((line) =>
      line.includes('post_install do |installer|')
    );

    if (postInstallStartIndex !== -1) {
      let depth = 1;
      for (let i = postInstallStartIndex + 1; i < lines.length; i += 1) {
        const line = lines[i];
        const doCount = (line.match(/\bdo\b/g) || []).length;
        const endCount = (line.match(/\bend\b/g) || []).length;
        depth += doCount - endCount;
        if (depth === 0) {
          lines.splice(i, 0, ...podsDeploymentTargetBlock.split('\n'));
          modConfig.modResults.contents = applyFmtXcode26Patch(lines.join('\n'));
          return modConfig;
        }
      }
    }

    modConfig.modResults.contents += `\npost_install do |installer|\n${podsDeploymentTargetBlock}end\n`;
    modConfig.modResults.contents = applyFmtXcode26Patch(
      modConfig.modResults.contents
    );

    return modConfig;
  });

  config = withPodfileProperties(config, (modConfig) => {
    modConfig.modResults['ios.deploymentTarget'] = deploymentTarget;
    return modConfig;
  });

  config = withXcodeProject(config, (modConfig) => {
    const project = modConfig.modResults;
    const buildConfigSection = project.pbxXCBuildConfigurationSection();

    for (const key in buildConfigSection) {
      if (!Object.prototype.hasOwnProperty.call(buildConfigSection, key)) {
        continue;
      }
      const buildConfig = buildConfigSection[key];
      if (!buildConfig || typeof buildConfig !== 'object' || !buildConfig.buildSettings) {
        continue;
      }
      buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = deploymentTarget;
    }
    return modConfig;
  });

  return config;
}

module.exports = createRunOncePlugin(withIosDeploymentTarget, pluginName, '1.0.0');
