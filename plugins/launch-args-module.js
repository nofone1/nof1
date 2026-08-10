const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const IOS_SWIFT = `import Foundation
import React

@objc(LaunchArgsModule)
class LaunchArgsModule: NSObject {
  @objc
  func getLaunchArguments(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    resolve(Array(ProcessInfo.processInfo.arguments.dropFirst()))
  }
}
`;

const IOS_EXTERN = `#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LaunchArgsModule, NSObject)

RCT_EXTERN_METHOD(getLaunchArguments:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
`;

const ANDROID_MODULE = packageName => `package ${packageName}

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray

class LaunchArgsModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "LaunchArgsModule"

  @ReactMethod
  fun getLaunchArguments(promise: Promise) {
    try {
      val args: WritableArray = Arguments.createArray()
      val extras = reactContext.currentActivity?.intent?.extras

      if (extras != null) {
        for (key in extras.keySet()) {
          if (key.startsWith("android.") || key.startsWith("com.android.")) {
            continue
          }
          args.pushString("-$key")
          args.pushString(extras.get(key)?.toString() ?: "")
        }
      }

      promise.resolve(args)
    } catch (error: Exception) {
      promise.reject("LAUNCH_ARGS_ERROR", error.message, error)
    }
  }
}
`;

const ANDROID_PACKAGE = packageName => `package ${packageName}

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class LaunchArgsPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(LaunchArgsModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
`;

function addSourceFileOnce(project, fileName, group) {
  const files = project.hash.project.objects.PBXFileReference || {};
  const alreadyAdded = Object.values(files).some(file => file && file.path === fileName);
  if (!alreadyAdded) {
    project.addSourceFile(fileName, { target: project.getFirstTarget().uuid }, group);
  }
}

function getAndroidPackage(config) {
  return config.android?.package || config.ios?.bundleIdentifier || 'com.bugbazaar.app';
}

function packageToPath(packageName) {
  return packageName.split('.').join(path.sep);
}

const withLaunchArgsModule = config => {
  config = withXcodeProject(config, config => {
    const project = config.modResults;
    const iosRoot = config.modRequest.platformProjectRoot;
    const projectName = config.modRequest.projectName;

    fs.writeFileSync(path.join(iosRoot, 'LaunchArgsModule.swift'), IOS_SWIFT);
    fs.writeFileSync(path.join(iosRoot, 'LaunchArgsModule.m'), IOS_EXTERN);

    const groups = project.hash.project.objects.PBXGroup;
    const mainGroup = project.getFirstProject().firstProject.mainGroup;
    const projectGroup = Object.keys(groups).find(key => {
      return groups[key].name === projectName || groups[key].path === projectName;
    }) || mainGroup;

    addSourceFileOnce(project, 'LaunchArgsModule.swift', projectGroup);
    addSourceFileOnce(project, 'LaunchArgsModule.m', projectGroup);
    return config;
  });

  config = withDangerousMod(config, ['android', config => {
    const packageName = getAndroidPackage(config);
    const androidRoot = config.modRequest.platformProjectRoot;
    const sourceRoot = path.join(
      androidRoot,
      'app',
      'src',
      'main',
      'java',
      packageToPath(packageName),
    );

    fs.mkdirSync(sourceRoot, { recursive: true });
    fs.writeFileSync(
      path.join(sourceRoot, 'LaunchArgsModule.kt'),
      ANDROID_MODULE(packageName),
    );
    fs.writeFileSync(
      path.join(sourceRoot, 'LaunchArgsPackage.kt'),
      ANDROID_PACKAGE(packageName),
    );

    const mainApplicationPath = path.join(sourceRoot, 'MainApplication.kt');
    if (fs.existsSync(mainApplicationPath)) {
      let source = fs.readFileSync(mainApplicationPath, 'utf8');
      if (!source.includes('LaunchArgsPackage()')) {
        source = source.replace(
          'PackageList(this).packages.apply {',
          'PackageList(this).packages.apply {\n              add(LaunchArgsPackage())',
        );
        source = source.replace(
          'val packages = PackageList(this).packages',
          'val packages = PackageList(this).packages.toMutableList()',
        );
        source = source.replace(
          'return PackageList(this).packages',
          'val packages = PackageList(this).packages.toMutableList()\n            packages.add(LaunchArgsPackage())\n            return packages',
        );
        source = source.replace(
          'return packages',
          'packages.add(LaunchArgsPackage())\n            return packages',
        );
        fs.writeFileSync(mainApplicationPath, source);
      }
    }

    return config;
  }]);

  return config;
};

module.exports = withLaunchArgsModule;
