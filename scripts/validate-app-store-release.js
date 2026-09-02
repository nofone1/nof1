#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const pkg = readJson("package.json");
const app = readJson("app.json").expo;
const eas = readJson("eas.json");
const dependencies = pkg.dependencies ?? {};

assert(Number.parseInt(dependencies.expo?.match(/\d+/)?.[0] ?? "0", 10) >= 57, "Expo SDK must be 57 or newer");
assert(Boolean(dependencies["@clerk/expo"]), "Use the supported @clerk/expo package");
assert(!dependencies["@clerk/clerk-expo"], "Deprecated @clerk/clerk-expo must not ship");
assert(!dependencies["terra-react"], "Terra must not ship in the first iOS release");
assert(!dependencies["expo-dev-client"], "The App Store package must not include expo-dev-client");
assert(!Object.keys(dependencies).some((name) => name.toLowerCase().includes("whop")), "External membership SDKs must not ship in the iOS app");
assert(app.ios?.supportsTablet === false, "First release must remain iPhone-only until iPad UI is reviewed");
assert(app.ios?.infoPlist?.ITSAppUsesNonExemptEncryption === false, "Encryption export-compliance declaration is missing");
assert(app.ios?.privacyManifests?.NSPrivacyTracking === false, "Privacy manifest must explicitly disable tracking");
assert(!JSON.stringify(app.plugins).includes("launch-args-module"), "Test launch-argument plugin must be conditional, not in app.json");
assert(eas.build?.production?.autoIncrement === true, "Production build numbers must auto-increment");
assert(eas.build?.production?.env?.EXPO_PUBLIC_SKIP_AUTH !== "true", "Production must not skip authentication");

const navigator = fs.readFileSync(path.join(root, "src/navigation/main-navigator.tsx"), "utf8");
for (const forbiddenRoute of ["Peptides", "PeptideDetail", "HealthConnections"]) {
  assert(!navigator.includes(forbiddenRoute), `Release navigation still exposes ${forbiddenRoute}`);
}

for (const removedPath of [
  "src/data/peptides.ts",
  "src/services/billing/whop-service.ts",
  "src/services/terra/terra-service.ts",
  "src/screens/profile/health-connections.tsx",
  "src/components/peptide/reconstitution-calculator.tsx",
]) {
  assert(!fs.existsSync(path.join(root, removedPath)), `Release-only removal regressed: ${removedPath}`);
}

const authSource = fs.readFileSync(path.join(root, "src/services/auth/auth-context.tsx"), "utf8");
assert(!authSource.includes("peptideking"), "Hard-coded development credentials must not ship");

const experimentDetail = fs.readFileSync(path.join(root, "src/screens/experiment/detail.tsx"), "utf8");
assert(!experimentDetail.includes("Entry Logged"), "Experiment logging must persist instead of showing a fake success alert");

const metadataDir = path.join(root, "store/metadata/en-US");
const requiredMetadata = [
  "name.txt",
  "subtitle.txt",
  "description.txt",
  "keywords.txt",
  "support_url.txt",
  "privacy_url.txt",
  "review_notes.txt",
];
for (const name of requiredMetadata) {
  assert(fs.existsSync(path.join(metadataDir, name)), `Missing App Store metadata: ${name}`);
}

const readMetadata = (name) => fs.readFileSync(path.join(metadataDir, name), "utf8").trim();
if (fs.existsSync(metadataDir)) {
  assert(readMetadata("name.txt").length <= 30, "App Store name exceeds 30 characters");
  assert(readMetadata("subtitle.txt").length <= 30, "App Store subtitle exceeds 30 characters");
  assert(readMetadata("keywords.txt").length <= 100, "App Store keywords exceed 100 characters");
}

for (const legalPage of ["privacy/index.md", "terms/index.md", "support/index.md"]) {
  assert(fs.existsSync(path.join(root, "site", legalPage)), `Missing public page source: ${legalPage}`);
}

for (const storeDocument of ["app-privacy.md", "subscriptions.md", "age-rating.md"]) {
  assert(fs.existsSync(path.join(root, "store", storeDocument)), `Missing submission guide: ${storeDocument}`);
}

if (failures.length) {
  console.error("App Store release validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("App Store release structure passed.");
