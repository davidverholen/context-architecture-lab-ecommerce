import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const requiredFiles = [
  "AGENTS.md",
  "docs/context/index.md",
  "docs/context/context-packs.md",
  "docs/context/handoff-protocols.md",
  "docs/context/learning-loops.md",
  "docs/context/open-questions.md",
  "docs/handoffs/index.md",
  "docs/checklists/architecture-change-checklist.md",
  "docs/checklists/learning-loop-checklist.md",
  "docs/overview/index.md"
];

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function fileExists(relativePath) {
  try {
    await readText(relativePath);
    return true;
  } catch {
    return false;
  }
}

async function listMarkdownFiles(relativeDir) {
  const dir = path.join(root, relativeDir);
  const entries = await readdir(dir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(relativeDir, entry.name))
    .sort();
}

function firstMatch(content, regex) {
  return content.match(regex)?.[1]?.trim() ?? null;
}

function normalizeStatus(status) {
  return status.trim().replace(/\.$/, "");
}

function countUnchecked(content) {
  return [...content.matchAll(/^- \[ \]/gm)].length;
}

function extractSections(content, heading) {
  const start = content.indexOf(heading);

  if (start === -1) {
    return "";
  }

  const rest = content.slice(start + heading.length);
  const next = rest.search(/\n## /);
  return next === -1 ? rest : rest.slice(0, next);
}

const missingFiles = [];

for (const file of requiredFiles) {
  if (!await fileExists(file)) {
    missingFiles.push(file);
  }
}

const handoffFiles = await listMarkdownFiles("docs/handoffs");
const handoffRecords = [];

for (const file of handoffFiles) {
  if (file.endsWith("-template.md") || file.endsWith("/index.md")) {
    continue;
  }

  const content = await readText(file);
  handoffRecords.push({
    file,
    title: firstMatch(content, /^# (.+)$/m) ?? path.basename(file),
    status: normalizeStatus(firstMatch(content, /^- Handoff status: (.+)$/m) ?? "Missing"),
    reviewGate: firstMatch(content, /^- Review gate: (.+)$/m) ?? "Not recorded",
    uncheckedItems: countUnchecked(content)
  });
}

const openHandoffs = handoffRecords.filter((record) =>
  ["requested", "blocked", "escalated", "approved with obligations", "missing"].includes(
    record.status.toLowerCase()
  )
);

const learningLoops = await readText("docs/context/learning-loops.md");
const currentLearnings = [
  ...extractSections(learningLoops, "## Current Curated Learnings")
    .matchAll(/^### (.+)$/gm)
].map((match) => match[1]);

const openQuestions = await readText("docs/context/open-questions.md");
const openQuestionCount = countUnchecked(openQuestions) + [...openQuestions.matchAll(/^- /gm)].length;

const processChecks = [
  {
    name: "Required context files",
    status: missingFiles.length === 0 ? "ok" : "action",
    detail: missingFiles.length === 0 ? "All required context files exist." : `Missing: ${missingFiles.join(", ")}`
  },
  {
    name: "Handoff review",
    status: openHandoffs.length === 0 ? "ok" : "action",
    detail: openHandoffs.length === 0
      ? "No open handoffs detected."
      : `${openHandoffs.length} open handoff(s): ${openHandoffs.map((record) => record.file).join(", ")}`
  },
  {
    name: "Learning loop",
    status: currentLearnings.length === 0 ? "action" : "ok",
    detail: currentLearnings.length === 0
      ? "No curated learnings recorded yet."
      : `${currentLearnings.length} curated learning(s): ${currentLearnings.join("; ")}`
  },
  {
    name: "Open questions",
    status: openQuestionCount === 0 ? "ok" : "info",
    detail: `${openQuestionCount} open question bullet(s) recorded.`
  }
];

console.log("# Context Architecture Process Check");
console.log("");

for (const check of processChecks) {
  const marker = check.status === "ok" ? "OK" : check.status === "action" ? "ACTION" : "INFO";
  console.log(`- ${marker}: ${check.name} - ${check.detail}`);
}

if (handoffRecords.length > 0) {
  console.log("");
  console.log("## Handoffs");

  for (const record of handoffRecords) {
    console.log(`- ${record.status}: ${record.title} (${record.file})`);
    console.log(`  Review gate: ${record.reviewGate}`);
  }
}

console.log("");
console.log("## Manual Process Guidance");

if (openHandoffs.length > 0) {
  console.log("- Close or update open handoffs before treating gated architecture as approved.");
}

if (currentLearnings.length > 0) {
  console.log("- Review curated learnings for scope creep before promoting them into broader policy.");
}

console.log("- Run `npm run validate:schemas` and `npm test` after schema, example, service, or workflow changes.");
console.log("- Use `docs/checklists/architecture-change-checklist.md` for medium/high-risk architecture changes.");

if (missingFiles.length > 0) {
  process.exitCode = 1;
}
