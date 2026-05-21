import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const DEFAULT_API_VERSION = "2026-04";
const DEFAULT_AUTH_MODE = "token";
const execFileAsync = promisify(execFile);

function parseEnvFile(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line === "" || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const [key, ...parts] = line.split("=");
    const rawValue = parts.join("=").trim();
    values[key.trim()] = rawValue.replace(/^["']|["']$/g, "");
  }

  return values;
}

export async function loadAgentEnv(envFile = ".env.agent") {
  let fileValues = {};

  try {
    const content = await readFile(path.resolve(process.cwd(), envFile), "utf8");
    fileValues = parseEnvFile(content);
  } catch {
    fileValues = {};
  }

  return {
    authMode: process.env.SHOPIFY_AGENT_AUTH_MODE
      ?? fileValues.SHOPIFY_AGENT_AUTH_MODE
      ?? DEFAULT_AUTH_MODE,
    shopDomain: process.env.SHOPIFY_AGENT_SHOP_DOMAIN
      ?? fileValues.SHOPIFY_AGENT_SHOP_DOMAIN
      ?? "",
    accessToken: process.env.SHOPIFY_AGENT_ADMIN_ACCESS_TOKEN
      ?? fileValues.SHOPIFY_AGENT_ADMIN_ACCESS_TOKEN
      ?? "",
    apiVersion: process.env.SHOPIFY_AGENT_API_VERSION
      ?? fileValues.SHOPIFY_AGENT_API_VERSION
      ?? DEFAULT_API_VERSION
  };
}

export function normalizeShopDomain(value) {
  return value
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
}

export function endpointFor(shopDomain, apiVersion = DEFAULT_API_VERSION) {
  return `https://${normalizeShopDomain(shopDomain)}/admin/api/${apiVersion}/graphql.json`;
}

export function assertAgentConfig(config) {
  if (!config.shopDomain) {
    throw new Error(
      "Missing Shopify agent shop domain. Create .env.agent from .env.agent.example and set SHOPIFY_AGENT_SHOP_DOMAIN."
    );
  }

  if (config.authMode === "token" && !config.accessToken) {
    throw new Error(
      "Missing Shopify agent Admin API token. Set SHOPIFY_AGENT_ADMIN_ACCESS_TOKEN or use SHOPIFY_AGENT_AUTH_MODE=cli after running shopify store auth."
    );
  }

  if (!["token", "cli"].includes(config.authMode)) {
    throw new Error("SHOPIFY_AGENT_AUTH_MODE must be either token or cli.");
  }
}

function isMutation(query) {
  return /^\s*mutation\b/i.test(query);
}

function normalizeCliGraphqlBody(value) {
  const body = value.body ?? value;

  if (
    body
    && typeof body === "object"
    && !Array.isArray(body)
    && !Object.hasOwn(body, "data")
    && !Object.hasOwn(body, "errors")
  ) {
    return { data: body };
  }

  return body;
}

async function shopifyGraphqlViaCli(query, variables, config, options = {}) {
  const args = [
    "store",
    "execute",
    "--store",
    normalizeShopDomain(config.shopDomain),
    "--query",
    query,
    "--json",
    "--no-color",
    "--version",
    config.apiVersion
  ];

  if (variables && Object.keys(variables).length > 0) {
    args.push("--variables", JSON.stringify(variables));
  }

  if (options.allowMutations || isMutation(query)) {
    args.push("--allow-mutations");
  }

  try {
    const { stdout } = await execFileAsync("shopify", args, {
      maxBuffer: 1024 * 1024 * 10
    });

    const parsed = JSON.parse(stdout);
    const body = normalizeCliGraphqlBody(parsed);

    return {
      ok: !body.errors,
      status: body.errors ? 1 : 200,
      body
    };
  } catch (error) {
    const detail = error.stderr || error.stdout || error.message;
    throw new Error(`Shopify CLI Admin GraphQL failed: ${detail}`);
  }
}

async function shopifyGraphqlViaToken(query, variables, config) {
  const response = await fetch(endpointFor(config.shopDomain, config.apiVersion), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-access-token": config.accessToken
    },
    body: JSON.stringify({
      query,
      variables
    })
  });
  const body = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    body
  };
}

export async function shopifyGraphql(query, variables = {}, options = {}) {
  const config = await loadAgentEnv(options.envFile);
  assertAgentConfig(config);

  const result = config.authMode === "cli"
    ? await shopifyGraphqlViaCli(query, variables, config, options)
    : await shopifyGraphqlViaToken(query, variables, config);

  return {
    authMode: config.authMode,
    shopDomain: normalizeShopDomain(config.shopDomain),
    apiVersion: config.apiVersion,
    ...result
  };
}
