import { readFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { buildApp as buildProductProjectionApp } from "../services/product-projection-service/src/server.js";
import { buildApp as buildShopifyAdminTargetApp } from "../services/shopify-admin-target/src/server.js";
import { normalizeShopifyAdminAuthMode } from "../services/shared/shopify-admin-target.js";

type EnvValues = Record<string, string>;

async function readEnvFile(path: string): Promise<EnvValues> {
  try {
    const content = await readFile(path, "utf8");
    return Object.fromEntries(
      content
        .split(/\r?\n/)
        .map((rawLine) => rawLine.trim())
        .filter((line) => line !== "" && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const [key, ...parts] = line.split("=");
          return [key.trim(), parts.join("=").trim().replace(/^["']|["']$/g, "")];
        })
    );
  } catch {
    return {};
  }
}

function urlFor(address: AddressInfo | string | null): string {
  if (!address || typeof address === "string") {
    throw new Error("Could not determine local Fastify address.");
  }

  return `http://127.0.0.1:${address.port}`;
}

function firstNonBlank(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined && value.trim() !== "");
}

const runtimeEnv = await readEnvFile(".env");
const agentEnv = await readEnvFile(".env.agent");

const shopDomain = firstNonBlank(
  process.env.SHOPIFY_SHOP_DOMAIN,
  runtimeEnv.SHOPIFY_SHOP_DOMAIN,
  process.env.SHOPIFY_AGENT_SHOP_DOMAIN,
  agentEnv.SHOPIFY_AGENT_SHOP_DOMAIN
);
const authMode = normalizeShopifyAdminAuthMode(
  firstNonBlank(
    process.env.SHOPIFY_ADMIN_AUTH_MODE,
    runtimeEnv.SHOPIFY_ADMIN_AUTH_MODE,
    process.env.SHOPIFY_AGENT_AUTH_MODE,
    agentEnv.SHOPIFY_AGENT_AUTH_MODE
  )
);
const accessToken = firstNonBlank(
  process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  runtimeEnv.SHOPIFY_ADMIN_ACCESS_TOKEN
);
const apiVersion = firstNonBlank(
  process.env.SHOPIFY_API_VERSION,
  runtimeEnv.SHOPIFY_API_VERSION
) ?? "2026-04";
const samplePath = firstNonBlank(
  process.env.SHOPIFY_LIVE_SAMPLE_EVENT
) ?? "examples/products/akeneo-rug-updated-event.sample.json";

if (!shopDomain) {
  console.error("SHOPIFY_SHOP_DOMAIN is required. For local CLI mode, .env.agent SHOPIFY_AGENT_SHOP_DOMAIN can be used as a fallback.");
  process.exit(1);
}

if (authMode === "token" && !accessToken) {
  console.error("SHOPIFY_ADMIN_ACCESS_TOKEN is required when SHOPIFY_ADMIN_AUTH_MODE=token. Use SHOPIFY_ADMIN_AUTH_MODE=cli for local Shopify CLI store auth.");
  process.exit(1);
}

const targetApp = buildShopifyAdminTargetApp({
  shopDomain,
  authMode,
  accessToken,
  apiVersion
});
let projectionApp: ReturnType<typeof buildProductProjectionApp> | undefined;

try {
  await targetApp.listen({ port: 0, host: "127.0.0.1" });
  const targetUrl = urlFor(targetApp.server.address());

  projectionApp = buildProductProjectionApp({
    productTarget: "shopify-dev-store",
    productTargetUrl: targetUrl
  });

  await projectionApp.listen({ port: 0, host: "127.0.0.1" });
  const projectionUrl = urlFor(projectionApp.server.address());
  const payload = JSON.parse(await readFile(samplePath, "utf8"));

  const response = await fetch(`${projectionUrl}/products/akeneo-events`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const body = await response.json();

  console.log(JSON.stringify({
    status_code: response.status,
    shop_domain: shopDomain,
    auth_mode: authMode,
    sample_event: samplePath,
    result: body
  }, null, 2));

  if (!response.ok || body.status !== "accepted") {
    process.exitCode = 1;
  }
} finally {
  await projectionApp?.close().catch(() => undefined);
  await targetApp.close().catch(() => undefined);
}
