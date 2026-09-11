#!/usr/bin/env python3
import argparse
import base64
import os
from pathlib import Path
import plistlib
import re
from urllib.parse import urlparse


def main():
    parser = argparse.ArgumentParser(description="Generate untracked native iOS configuration without printing values")
    parser.add_argument("--mode", required=True, choices=["cloud", "local-demo"])
    args = parser.parse_args()
    key = os.environ.get("NOF1_CLERK_PUBLISHABLE_KEY", "")
    deployment = os.environ.get("NOF1_CONVEX_URL", "")
    domain = os.environ.get("NOF1_CLERK_FRONTEND_DOMAIN", "")
    if args.mode == "cloud":
        if not re.fullmatch(r"pk_(test|live)_[A-Za-z0-9+/=]+", key):
            parser.error("NOF1_CLERK_PUBLISHABLE_KEY must be a valid public Clerk key")
        try:
            decoded = base64.b64decode(key.split("_", 2)[2] + "===").decode()
            if not decoded.endswith("$") or "." not in decoded:
                raise ValueError()
        except (ValueError, UnicodeDecodeError):
            parser.error("NOF1_CLERK_PUBLISHABLE_KEY has an invalid payload")
        url = urlparse(deployment)
        if url.scheme != "https" or not url.hostname or url.username or url.password or url.query or url.fragment or url.path not in ("", "/"):
            parser.error("NOF1_CONVEX_URL must be an HTTPS deployment origin without credentials")
        if not re.fullmatch(r"[A-Za-z0-9.-]+\.[A-Za-z]{2,}", domain):
            parser.error("NOF1_CLERK_FRONTEND_DOMAIN must be a host, without scheme or path")
    else:
        key, deployment, domain = "", "", ""
    root = Path(__file__).resolve().parent.parent / "Config.generated"
    root.mkdir(exist_ok=True, mode=0o700)
    info = {
        "CFBundleDevelopmentRegion": "en",
        "CFBundleDisplayName": "Nof1 Native",
        "CFBundleExecutable": "$(EXECUTABLE_NAME)",
        "CFBundleIdentifier": "$(PRODUCT_BUNDLE_IDENTIFIER)",
        "CFBundleInfoDictionaryVersion": "6.0",
        "CFBundleName": "$(PRODUCT_NAME)",
        "CFBundlePackageType": "APPL",
        "CFBundleShortVersionString": "$(MARKETING_VERSION)",
        "CFBundleVersion": "$(CURRENT_PROJECT_VERSION)",
        "LSRequiresIPhoneOS": True,
        "UILaunchScreen": {},
        "UIApplicationSceneManifest": {"UIApplicationSupportsMultipleScenes": False},
        "UIUserInterfaceStyle": "Dark",
        "UISupportedInterfaceOrientations": ["UIInterfaceOrientationPortrait", "UIInterfaceOrientationLandscapeLeft", "UIInterfaceOrientationLandscapeRight"],
        "CFBundleURLTypes": [{"CFBundleURLName": "native-auth", "CFBundleURLSchemes": ["com.nof1.experiments.native"]}],
        "ITSAppUsesNonExemptEncryption": False,
        "Nof1Mode": args.mode,
        "Nof1ClerkPublishableKey": key,
        "Nof1ConvexURL": deployment,
    }
    for filename, content in [("Info.plist", info), ("Nof1Native.entitlements", {"com.apple.developer.associated-domains": [f"webcredentials:{domain}"]} if domain else {})]:
        path = root / filename
        path.write_bytes(plistlib.dumps(content))
        path.chmod(0o600)
    (root / "Config.xcconfig").write_text(f"NOF1_MODE = {args.mode}\n")
    (root / "Config.xcconfig").chmod(0o600)
    print(f"Generated ignored configuration for {args.mode}; no configuration values printed.")


if __name__ == "__main__":
    main()
