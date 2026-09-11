#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

mode="${1:?Pass cloud or local-demo explicitly}"
python3 scripts/configure.py --mode "$mode"
xcodebuild -version
swift --version
mkdir -p build/tooling
curl --fail --location --silent --show-error \
  https://github.com/yonaskolb/XcodeGen/releases/download/2.44.1/xcodegen.zip \
  --output build/tooling/xcodegen.zip
printf '%s\n' 'a2e905fb68446e9bb4008cdfe2e13e3f176d0cbcca828b71770f8e53fca91b73  build/tooling/xcodegen.zip' | shasum -a 256 --check
unzip -oq build/tooling/xcodegen.zip -d build/tooling
export USER="${USER:-$(id -un)}"
build/tooling/xcodegen/bin/xcodegen generate --spec project.yml
xcodebuild -resolvePackageDependencies -project Nof1Native.xcodeproj -scheme Nof1Native
xcodebuild -project Nof1Native.xcodeproj -scheme Nof1Native \
  -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath build/DerivedData CODE_SIGNING_ALLOWED=NO ARCHS=arm64 build
test -d build/DerivedData/Build/Products/Debug-iphonesimulator/Nof1Native.app
