import { NativeModules } from 'react-native';

type LaunchArgsModuleType = {
  getLaunchArguments(): Promise<string[]>;
};

export default NativeModules.LaunchArgsModule as
  | LaunchArgsModuleType
  | undefined;
