import base64
import os
from pathlib import Path
import plistlib
import shutil
import subprocess
import tempfile
import unittest


class ConfigureTests(unittest.TestCase):
    def run_configure(self, mode, values=None):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name)
        (root / "scripts").mkdir()
        shutil.copy(Path(__file__).with_name("configure.py"), root / "scripts/configure.py")
        environment = {key: value for key, value in os.environ.items() if not key.startswith("NOF1_")}
        environment.update(values or {})
        result = subprocess.run(["python3", str(root / "scripts/configure.py"), "--mode", mode], env=environment, capture_output=True, text=True)
        return root, result

    def test_local_mode_cannot_accidentally_embed_cloud_configuration(self):
        root, result = self.run_configure("local-demo", {"NOF1_CLERK_PUBLISHABLE_KEY": "must-not-appear", "NOF1_CONVEX_URL": "must-not-appear"})
        self.assertEqual(result.returncode, 0)
        raw = (root / "Config.generated/Info.plist").read_bytes()
        self.assertNotIn(b"must-not-appear", raw)
        self.assertEqual(plistlib.loads(raw)["Nof1Mode"], "local-demo")
        self.assertNotIn("must-not-appear", result.stdout + result.stderr)

    def test_missing_cloud_configuration_fails_without_local_fallback(self):
        root, result = self.run_configure("cloud")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((root / "Config.generated").exists())

    def test_cloud_configuration_has_isolated_callback_and_associated_domain(self):
        public_key = "pk_test_" + base64.b64encode(b"example.clerk.accounts.dev$").decode()
        root, result = self.run_configure("cloud", {
            "NOF1_CLERK_PUBLISHABLE_KEY": public_key,
            "NOF1_CONVEX_URL": "https://example.convex.cloud",
            "NOF1_CLERK_FRONTEND_DOMAIN": "example.clerk.accounts.dev",
        })
        self.assertEqual(result.returncode, 0)
        info = plistlib.loads((root / "Config.generated/Info.plist").read_bytes())
        self.assertEqual(info["Nof1ClerkPublishableKey"], public_key)
        self.assertEqual(info["CFBundleURLTypes"][0]["CFBundleURLSchemes"], ["com.nof1.experiments.native"])
        entitlements = plistlib.loads((root / "Config.generated/Nof1Native.entitlements").read_bytes())
        self.assertEqual(entitlements["com.apple.developer.associated-domains"], ["webcredentials:example.clerk.accounts.dev"])
        self.assertNotIn(public_key, result.stdout + result.stderr)

    def test_cloud_url_with_embedded_credentials_is_rejected(self):
        root, result = self.run_configure("cloud", {
            "NOF1_CLERK_PUBLISHABLE_KEY": "pk_test_" + base64.b64encode(b"example.clerk.accounts.dev$").decode(),
            "NOF1_CONVEX_URL": "https://user:password@example.convex.cloud",
            "NOF1_CLERK_FRONTEND_DOMAIN": "example.clerk.accounts.dev",
        })
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((root / "Config.generated").exists())
        self.assertNotIn("password", result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
