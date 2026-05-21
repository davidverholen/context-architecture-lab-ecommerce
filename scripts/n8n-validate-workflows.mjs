import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const workflowDir = path.join(root, "n8n", "workflows");

const allowedLocalHosts = [
  "commerce-integration-service",
  "product-projection-service",
  "akeneo-event-bridge",
  "mock-wms",
  "mock-pim",
  "mock-shopify",
  "governance-service"
];

function walkNodes(nodes = []) {
  return nodes.flatMap((node) => {
    const values = [];
    const stack = [node.parameters ?? {}];

    while (stack.length > 0) {
      const value = stack.pop();

      if (typeof value === "string") {
        values.push(value);
        continue;
      }

      if (Array.isArray(value)) {
        stack.push(...value);
        continue;
      }

      if (value && typeof value === "object") {
        stack.push(...Object.values(value));
      }
    }

    return values;
  });
}

function validateWorkflow(file, workflow) {
  const errors = [];
  const warnings = [];

  if (typeof workflow.name !== "string" || workflow.name.trim() === "") {
    errors.push("workflow.name is required");
  }

  if (typeof workflow.id !== "string" || workflow.id.trim() === "") {
    errors.push("workflow.id is required so repeated CLI imports overwrite instead of duplicating workflows");
  }

  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    errors.push("workflow.nodes must be a non-empty array");
  }

  if (!workflow.connections || typeof workflow.connections !== "object") {
    errors.push("workflow.connections is required");
  }

  for (const node of workflow.nodes ?? []) {
    if (!node.id || !node.name || !node.type) {
      errors.push(`node ${node.name ?? node.id ?? "<unknown>"} is missing id, name, or type`);
    }

    if (node.credentials) {
      warnings.push(`node ${node.name} references credentials; keep real credentials out of repo workflows`);
    }
  }

  const textValues = walkNodes(workflow.nodes);
  const externalUrls = textValues.filter((value) => {
    const matches = [...value.matchAll(/https?:\/\/([^/\s"']+)/g)];
    return matches.some((match) => {
      const host = match[1].split(":")[0];
      return !allowedLocalHosts.includes(host) && host !== "localhost" && host !== "127.0.0.1";
    });
  });

  for (const value of externalUrls) {
    warnings.push(`possible external URL in workflow parameters: ${value}`);
  }

  return { file, errors, warnings };
}

const entries = await readdir(workflowDir, { withFileTypes: true });
const workflowFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => path.join("n8n", "workflows", entry.name))
  .sort();

let failed = false;

if (workflowFiles.length === 0) {
  failed = true;
  console.error("FAIL no workflow JSON files found in n8n/workflows");
}

for (const file of workflowFiles) {
  const content = await readFile(path.join(root, file), "utf8");
  let workflow;

  try {
    workflow = JSON.parse(content);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${file}`);
    console.error(`  invalid JSON: ${error.message}`);
    continue;
  }

  const result = validateWorkflow(file, workflow);

  if (result.errors.length > 0) {
    failed = true;
    console.error(`FAIL ${file}`);
    for (const error of result.errors) {
      console.error(`  ${error}`);
    }
  } else {
    console.log(`PASS ${file}`);
  }

  for (const warning of result.warnings) {
    console.warn(`WARN ${file}`);
    console.warn(`  ${warning}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("All n8n workflow JSON files passed local validation.");
