const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { resolve: metroResolve } = require("metro-resolver");

/**
 * Metro config with explicit @/ -> src/ resolution.
 *
 * Release xcodebuild runs `expo export:embed` with
 * `--config-cmd 'react-native/cli.js config'`, which does not always apply
 * tsconfig paths. Without this alias, the Bundle RN phase fails on imports
 * like `@/providers/providers`.
 */
const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolvedName = moduleName.startsWith("@/")
    ? path.resolve(projectRoot, "src", moduleName.slice(2))
    : moduleName;

  return metroResolve(
    {
      ...context,
      resolveRequest: metroResolve,
    },
    resolvedName,
    platform,
  );
};

module.exports = config;
