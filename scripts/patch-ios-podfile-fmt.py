#!/usr/bin/env python3
"""Patch the Expo-generated ios/Podfile so fmt builds on Xcode 26+.

fmt 11.0.2 (via React Native) enables consteval under Apple Clang, but
Xcode 26's clang rejects those FMT_STRING call sites. Setting
FMT_USE_CONSTEVAL via preprocessor flags does not work for 11.0.2 because
base.h unconditionally redefines the macro. Compiling only the fmt pod as
C++17 disables consteval without changing the rest of the RN stack.

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
MARKER = "CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'"
PATCH = """
    # Xcode 26+: fmt 11.0.2 consteval breaks under newer Apple Clang.
    # C++17 disables consteval for this pod only (RN still uses C++20).
    installer.pods_project.targets.each do |target|
      next unless target.name == 'fmt'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end
"""


def main() -> int:
    """Apply the fmt C++17 workaround to ios/Podfile."""
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
    print(f"{PODFILE}: applied fmt C++17 workaround for Xcode 26")
    return 0


if __name__ == "__main__":
    sys.exit(main())
