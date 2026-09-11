import { createHash } from "node:crypto";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const sourceRoot = resolve(repositoryRoot, "src");
const modules = new Map();
const sourceHashes = {};

function loadSource(relativePath) {
  const filename = resolve(repositoryRoot, relativePath);
  if (
    !filename.startsWith(`${sourceRoot}${sep}`) ||
    !filename.endsWith(".ts")
  ) {
    throw new Error(`Unsupported shared-resource source: ${relativePath}`);
  }
  if (modules.has(filename)) return modules.get(filename);
  const source = readFileSync(filename, "utf8");
  const exports = {};
  modules.set(filename, exports);
  sourceHashes[relativePath] = createHash("sha256")
    .update(source)
    .digest("hex");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
    fileName: filename,
  });
  const errors = compiled.diagnostics?.filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  if (errors?.length) {
    throw new Error(`TypeScript transpilation failed for ${relativePath}`);
  }
  runInNewContext(
    compiled.outputText,
    {
      exports,
      require(specifier) {
        if (!specifier.startsWith("@/")) {
          throw new Error(`Unsupported catalog dependency: ${specifier}`);
        }
        return loadSource(`src/${specifier.slice(2)}.ts`);
      },
    },
    { filename, timeout: 1000 },
  );
  return exports;
}

const catalog = loadSource("src/data/peptides.ts").PEPTIDES;
const peptideTypes = loadSource("src/types/peptide.ts");
const trackingTypes = loadSource("src/types/tracking.ts");
const theme = loadSource("src/theme/colors.ts").colors;
const { calculateDecay } = loadSource("src/utils/pharmacokinetics.ts");

if (!Array.isArray(catalog) || catalog.length === 0) {
  throw new Error("The source catalog is empty or invalid");
}
if (new Set(catalog.map((item) => item.id)).size !== catalog.length) {
  throw new Error("The source catalog contains duplicate IDs");
}

const outputs = {
  "catalog.json": catalog,
  "reference.json": {
    formatVersion: 1,
    sourceHashes,
    categories: Object.values(peptideTypes.PeptideCategory).map((id) => ({
      id,
      label: peptideTypes.getCategoryDisplay(id),
    })),
    researchLevels: Object.values(peptideTypes.ResearchLevel).map((id) => ({
      id,
      label: peptideTypes.getResearchLevelDisplay(id),
      color: peptideTypes.getResearchLevelColor(id),
    })),
    administrationRoutes: Object.values(peptideTypes.AdministrationRoute),
    injectionSites: trackingTypes.INJECTION_SITE_LABELS,
    metricTypes: trackingTypes.QUICK_METRIC_INFO,
    theme,
  },
  "calculations.json": {
    formatVersion: 1,
    decay: [
      [6, 0],
      [6, 3],
      [6, 6],
      [6, 12],
      [24, 72],
      [0, 1],
      [-1, 1],
      [6, -1],
    ].map(([halfLifeHours, hoursElapsed]) => ({
      halfLifeHours,
      hoursElapsed,
      expectedPercentage: calculateDecay(halfLifeHours, hoursElapsed),
    })),
  },
};

const checkOnly = process.argv.includes("--check");
for (const [name, data] of Object.entries(outputs)) {
  const outputPath = resolve(repositoryRoot, "native/shared", name);
  const serialized = `${JSON.stringify(data, null, 2)}\n`;
  if (checkOnly) {
    if (readFileSync(outputPath, "utf8") !== serialized) {
      throw new Error(
        `${name} is stale; run node native/scripts/export-shared.mjs`,
      );
    }
  } else {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, serialized);
  }
}
console.log(
  `${checkOnly ? "Verified" : "Exported"} ${catalog.length} catalog entries and shared native references.`,
);
