import Ajv from "ajv";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const pairs = [
  ["schemas/shopify-order-created.schema.json", "examples/orders/shopify-order-created.sample.json"],
  ["schemas/canonical-order.schema.json", "examples/orders/canonical-order.sample.json"],
  ["schemas/mock-wms-order.schema.json", "examples/orders/mock-wms-order.sample.json"],
  ["schemas/pim-product.schema.json", "examples/products/pim-rug-product.sample.json"],
  ["schemas/shopify-product-projection.schema.json", "examples/products/shopify-rug-projection.sample.json"],
  ["schemas/akeneo-product-export.schema.json", "examples/products/akeneo-rug-export.sample.json"],
  ["schemas/akeneo-product-export.schema.json", "examples/products/akeneo-rug-updated-event.sample.json"],
  ["schemas/akeneo-product-export.schema.json", "examples/products/akeneo-rug-removed-event.sample.json"],
  ["schemas/akeneo-webhook-product-event.schema.json", "examples/products/akeneo-webhook-product-updated.sample.json"],
  ["schemas/product-projection-job.schema.json", "examples/products/product-projection-job.sample.json"],
  ["schemas/shopify-product-removal.schema.json", "examples/products/shopify-product-removal.sample.json"],
  ["schemas/product-projection-result.schema.json", "examples/products/product-projection-result.sample.json"],
  ["schemas/product-projection-result.schema.json", "examples/products/product-projection-incomplete-result.sample.json"],
  ["schemas/change-request.schema.json", "examples/changes/integration-mapping-change.sample.json"],
  ["schemas/governance-decision.schema.json", "examples/changes/governance-decision.sample.json"]
];

const ajv = new Ajv({ allErrors: true, strict: false });

async function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  const content = await readFile(fullPath, "utf8");
  return JSON.parse(content);
}

async function listSampleJsonFiles(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listSampleJsonFiles(relativePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".sample.json")) {
      files.push(relativePath);
    }
  }

  return files.sort();
}

let failed = false;
const validators = new Map();

const mappedSamples = new Set(pairs.map(([, samplePath]) => samplePath));
const discoveredSamples = await listSampleJsonFiles("examples");

for (const samplePath of discoveredSamples) {
  if (!mappedSamples.has(samplePath)) {
    failed = true;
    console.error(`FAIL ${samplePath}`);
    console.error("  sample has no schema validation mapping");
  }
}

for (const [schemaPath, samplePath] of pairs) {
  if (!validators.has(schemaPath)) {
    const schema = await readJson(schemaPath);
    validators.set(schemaPath, ajv.compile(schema));
  }

  const sample = await readJson(samplePath);
  const validate = validators.get(schemaPath);
  const valid = validate(sample);

  if (valid) {
    console.log(`PASS ${samplePath}`);
    continue;
  }

  failed = true;
  console.error(`FAIL ${samplePath}`);
  for (const error of validate.errors ?? []) {
    console.error(`  ${error.instancePath || "/"} ${error.message}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("All schema examples validated.");
