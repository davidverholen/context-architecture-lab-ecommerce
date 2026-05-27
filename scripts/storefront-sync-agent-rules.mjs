import { copyFile, mkdir, readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const storefrontDir = process.env.STOREFRONT_DIR ?? "apps/storefront";
const sourceDir = process.env.HYDROGEN_CURSOR_RULES_SOURCE
  ?? path.join(
    storefrontDir,
    "node_modules/@shopify/cli/dist/assets/hydrogen/starter/.cursor/rules"
  );
const targetDir = process.env.HYDROGEN_CURSOR_RULES_TARGET
  ?? path.join(storefrontDir, ".cursor/rules");
const write = process.argv.includes("--write");
const force = process.argv.includes("--force");
const help = process.argv.includes("--help") || process.argv.includes("-h");

if (help) {
  console.log(`Usage: node scripts/storefront-sync-agent-rules.mjs [--write] [--force]

Checks Hydrogen starter Cursor rules from the installed Shopify CLI against the
tracked storefront rules.

Default:
  Report missing or changed upstream rules without modifying files.

Options:
  --write   Copy missing upstream rules into apps/storefront/.cursor/rules.
  --force   With --write, also overwrite changed local rules.

Environment:
  STOREFRONT_DIR
  HYDROGEN_CURSOR_RULES_SOURCE
  HYDROGEN_CURSOR_RULES_TARGET`);
  process.exit(0);
}

async function listFiles(root) {
  const files = [];

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
      } else if (entry.isFile()) {
        files.push(path.relative(root, absolutePath));
      }
    }
  }

  await walk(root);
  return files.sort();
}

async function readIfExists(filePath) {
  if (!existsSync(filePath)) return null;
  return await readFile(filePath);
}

function report(status, relativePath, detail = "") {
  console.log(`${status.padEnd(12)} ${relativePath}${detail ? ` ${detail}` : ""}`);
}

if (!existsSync(sourceDir)) {
  console.error(
    `Hydrogen starter Cursor rules were not found at ${sourceDir}. ` +
    "Install storefront dependencies or set HYDROGEN_CURSOR_RULES_SOURCE."
  );
  process.exit(1);
}

const sourceFiles = await listFiles(sourceDir);
const targetFiles = existsSync(targetDir) ? await listFiles(targetDir) : [];
const sourceSet = new Set(sourceFiles);
const targetSet = new Set(targetFiles);
const changed = [];
const missing = [];

for (const relativePath of sourceFiles) {
  const sourcePath = path.join(sourceDir, relativePath);
  const targetPath = path.join(targetDir, relativePath);
  const sourceContent = await readFile(sourcePath);
  const targetContent = await readIfExists(targetPath);

  if (!targetContent) {
    missing.push(relativePath);
    if (write) {
      await mkdir(path.dirname(targetPath), { recursive: true });
      await copyFile(sourcePath, targetPath);
      report("COPIED", relativePath);
    } else {
      report("MISSING", relativePath);
    }
    continue;
  }

  if (!sourceContent.equals(targetContent)) {
    changed.push(relativePath);
    if (write && force) {
      await copyFile(sourcePath, targetPath);
      report("OVERWROTE", relativePath);
    } else {
      report("CHANGED", relativePath, "(review before overwriting)");
    }
    continue;
  }

  report("OK", relativePath);
}

for (const relativePath of targetFiles) {
  if (!sourceSet.has(relativePath)) {
    report("LOCAL_ONLY", relativePath);
  }
}

const unresolvedMissing = write ? 0 : missing.length;
const unresolvedChanged = write && force ? 0 : changed.length;

if (unresolvedMissing > 0 || unresolvedChanged > 0) {
  console.error(
    `Hydrogen agent rule check found ${unresolvedMissing} missing and ` +
    `${unresolvedChanged} changed upstream rule(s).`
  );
  process.exit(1);
}

if (write && missing.length > 0) {
  console.log(`Copied ${missing.length} missing Hydrogen agent rule(s).`);
}
