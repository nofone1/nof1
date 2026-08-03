#!/usr/bin/env python3
"""Patch the Expo-generated ios/Podfile so fmt builds on Xcode 16.3+/26.

Xcode's clang rejects fmt's consteval format strings (FMT_USE_CONSTEVAL),
which breaks React Native Pods (fmt) during simulator builds.

Parameters:
    None. Reads and writes ios/Podfile relative to the repo root (cwd).

Returns:
    Exit code 0 on success or when the patch is already present.

Raises:
    SystemExit: When ios/Podfile is missing or has no post_install hook.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

PODFILE = Path("ios/Podfile")
MARKER = "FMT_USE_CONSTEVAL=0"
PATCH = """
    # Xcode 16.3+/26: fmt consteval breaks React Native Pod builds.
    installer.pods_project.targets.each do |target|
      next unless target.name == 'fmt'
      target.build_configurations.each do |config|
        defs = config.build_settings['GCC_PREPROCESSOR_DEFINITIONS']
        defs = ['$(inherited)'] if defs.nil?
        defs = [defs] unless defs.is_a?(Array)
        defs << 'FMT_USE_CONSTEVAL=0' unless defs.any? { |d| d.to_s.include?('FMT_USE_CONSTEVAL') }
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs
      end
    end
"""


def main() -> int:
    """Apply the fmt preprocessor workaround to ios/Podfile."""
    if not PODFILE.is_file():
        raise SystemExit(f"Missing {PODFILE}; run expo prebuild first")

    text = PODFILE.read_text(encoding="utf-8")
    if MARKER in text:
        print(f"{PODFILE}: fmt Xcode patch already present")
        return 0

    if "post_install do |installer|" not in text:
        raise SystemExit(f"{PODFILE}: no post_install hook to patch")

    # Prefer inserting after react_native_post_install(...) so RN settings apply first.
    match = re.search(
        r"react_native_post_install\([\s\S]*?\)\n",
        text,
    )
    if match:
        updated = text[: match.end()] + PATCH + text[match.end() :]
    else:
        updated = text.replace(
            "post_install do |installer|",
            "post_install do |installer|\n" + PATCH,
            1,
        )

    PODFILE.write_text(updated, encoding="utf-8")
    print(f"{PODFILE}: applied fmt Xcode consteval workaround")
    return 0


if __name__ == "__main__":
    sys.exit(main())
