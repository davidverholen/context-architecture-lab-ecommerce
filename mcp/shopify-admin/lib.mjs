import { readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_API_VERSION = "2026-04";

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
  if (!config.shopDomain || !config.accessToken) {
    throw new Error(
      "Missing Shopify agent credentials. Create .env.agent from .env.agent.example and set SHOPIFY_AGENT_SHOP_DOMAIN plus SHOPIFY_AGENT_ADMIN_ACCESS_TOKEN."
    );
  }
}

export async function shopifyGraphql(query, variables = {}, options = {}) {
  const config = await loadAgentEnv(options.envFile);
  assertAgentConfig(config);

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
    shopDomain: normalizeShopDomain(config.shopDomain),
    apiVersion: config.apiVersion,
    body
  };
}
