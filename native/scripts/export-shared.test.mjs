import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const readShared = (name) =>
  JSON.parse(
    readFileSync(new URL(`../shared/${name}`, import.meta.url), "utf8"),
  );

test("generated native resources match the maintained TypeScript source", () => {
  execFileSync(
    process.execPath,
    [fileURLToPath(new URL("export-shared.mjs", import.meta.url)), "--check"],
    {
      timeout: 10_000,
    },
  );
});

test("catalog entries retain unique stable IDs and complete source detail", () => {
  const catalog = readShared("catalog.json");
  assert.ok(catalog.length > 0);
  assert.equal(new Set(catalog.map((item) => item.id)).size, catalog.length);
  for (const item of catalog) {
    assert.equal(typeof item.id, "string");
    assert.equal(typeof item.name, "string");
    assert.ok(item.overview.description.length > 0);
    assert.ok(Array.isArray(item.categories));
  }
});

test("calculation contract includes exact half-life and invalid-input cases", () => {
  const { decay } = readShared("calculations.json");
  assert.equal(
    decay.find((item) => item.halfLifeHours === 6 && item.hoursElapsed === 6)
      .expectedPercentage,
    50,
  );
  assert.equal(
    decay.find((item) => item.halfLifeHours === 6 && item.hoursElapsed === 12)
      .expectedPercentage,
    25,
  );
  for (const item of decay.filter(
    (item) => item.halfLifeHours <= 0 || item.hoursElapsed < 0,
  )) {
    assert.equal(item.expectedPercentage, 0);
  }
});
