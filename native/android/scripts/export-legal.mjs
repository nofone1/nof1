import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const source = readFileSync(fileURLToPath(new URL("../../../src/screens/legal/index.tsx", import.meta.url)), "utf8");
const updated = source.match(/const LAST_UPDATED = "([^"]+)";/)?.[1];
const supportEmail = source.match(/const SUPPORT_EMAIL = "([^"]+)";/)?.[1];
if (!updated || !supportEmail) throw new Error("Missing legal source metadata");
const documents = {};
for (const [key, constant, title] of [["privacy", "PRIVACY_SECTIONS", "Privacy Policy"], ["terms", "TERMS_SECTIONS", "Terms of Service"], ["medical", "MEDICAL_SECTIONS", "Medical Safety"]]) {
  const match = source.match(new RegExp(`const ${constant}: LegalSection\\[\\] = (\\[[\\s\\S]*?\\n\\]);`));
  if (!match) throw new Error(`Missing legal source: ${constant}`);
  documents[key] = { title, updated, sections: vm.runInNewContext(match[1], { SUPPORT_EMAIL: supportEmail }) };
}
writeFileSync(fileURLToPath(new URL("../app/src/main/assets/legal.json", import.meta.url)), JSON.stringify(documents, null, 2) + "\n");
