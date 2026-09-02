module.exports = ({ config }) => {
  // The native launch-arguments bridge exists only in explicitly marked
  // internal test builds. Production/TestFlight binaries cannot include it.
  if (process.env.EXPO_PUBLIC_SKIP_AUTH === "true") {
    config.plugins.push("./plugins/launch-args-module");
  }

  return config;
};
