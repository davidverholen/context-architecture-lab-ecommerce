import { execFileSync } from "node:child_process";

const akeneoDir = process.env.AKENEO_DIR ?? ".local/akeneo/pim";
const baseUrl = (process.env.AKENEO_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const username = process.env.AKENEO_USERNAME ?? "admin";
const password = process.env.AKENEO_PASSWORD ?? "admin";
const identifier = process.env.AKENEO_RUG_SKU ?? "RUG-ATLAS-170X240-SAND";
const updateStamp = new Date().toISOString();

function runAkeneoConsole(args) {
  return execFileSync(
    "bash",
    ["-lc", `cd ${JSON.stringify(akeneoDir)} && docker compose run --rm php bin/console ${args.join(" ")}`],
    { encoding: "utf8" }
  );
}

function findApiClient() {
  if (process.env.AKENEO_API_CLIENT_ID && process.env.AKENEO_API_CLIENT_SECRET) {
    return {
      clientId: process.env.AKENEO_API_CLIENT_ID,
      clientSecret: process.env.AKENEO_API_CLIENT_SECRET
    };
  }

  const output = runAkeneoConsole(["pim:oauth-server:list-clients", "--no-ansi"]);
  const row = output
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("|") && line.includes("_") && !line.includes("client id"));

  if (!row) {
    throw new Error("Could not find a local Akeneo API client. Run npm run akeneo:setup first.");
  }

  const columns = row
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    clientId: columns[0],
    clientSecret: columns[1]
  };
}

async function token() {
  const { clientId, clientSecret } = findApiClient();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${baseUrl}/api/oauth/v1/token`, {
    method: "POST",
    headers: {
      authorization: `Basic ${credentials}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      grant_type: "password",
      username,
      password
    })
  });

  if (!response.ok) {
    throw new Error(`Akeneo token request failed: HTTP ${response.status} ${await response.text()}`);
  }

  const body = await response.json();
  return body.access_token;
}

async function api(accessToken, method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json"
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 404 && method === "GET") {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${method} ${path} failed: HTTP ${response.status} ${await response.text()}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text.trim() === "" ? null : JSON.parse(text);
}

async function upsertAttribute(accessToken, definition) {
  const existing = await api(accessToken, "GET", `/api/rest/v1/attributes/${definition.code}`);

  if (existing) {
    console.log(`Attribute ${definition.code} exists as ${existing.type}; keeping existing definition.`);
    return existing;
  }

  await api(accessToken, "PATCH", `/api/rest/v1/attributes/${definition.code}`, definition);
  console.log(`Created attribute ${definition.code}.`);
  return definition;
}

async function upsertOption(accessToken, attributeCode, code, label) {
  await api(accessToken, "PATCH", `/api/rest/v1/attributes/${attributeCode}/options/${code}`, {
    code,
    labels: {
      en_US: label
    }
  });
  console.log(`Upserted option ${attributeCode}.${code}.`);
}

const accessToken = await token();

await upsertAttribute(accessToken, {
  code: "shape",
  type: "pim_catalog_text",
  group: "other",
  labels: { en_US: "Shape" },
  localizable: false,
  scopable: false
});

await upsertAttribute(accessToken, {
  code: "pile_height_mm",
  type: "pim_catalog_number",
  group: "other",
  labels: { en_US: "Pile height mm" },
  localizable: false,
  scopable: false,
  decimals_allowed: false,
  negative_allowed: false
});

await upsertAttribute(accessToken, {
  code: "care_instruction",
  type: "pim_catalog_textarea",
  group: "other",
  labels: { en_US: "Care instruction" },
  localizable: true,
  scopable: false
});

await upsertAttribute(accessToken, {
  code: "suitable_rooms",
  type: "pim_catalog_multiselect",
  group: "other",
  labels: { en_US: "Suitable rooms" },
  localizable: false,
  scopable: false
});

await upsertAttribute(accessToken, {
  code: "style",
  type: "pim_catalog_text",
  group: "other",
  labels: { en_US: "Style" },
  localizable: false,
  scopable: false
});

await upsertAttribute(accessToken, {
  code: "origin_country",
  type: "pim_catalog_text",
  group: "other",
  labels: { en_US: "Origin country" },
  localizable: false,
  scopable: false
});

await upsertOption(accessToken, "material", "wool", "Wool");
await upsertOption(accessToken, "color", "sand", "Sand");
await upsertOption(accessToken, "size", "170x240_cm", "170x240 cm");
await upsertOption(accessToken, "suitable_rooms", "living_room", "Living room");
await upsertOption(accessToken, "suitable_rooms", "bedroom", "Bedroom");

await api(accessToken, "PATCH", "/api/rest/v1/families/rug", {
  code: "rug",
  labels: {
    en_US: "Rug"
  },
  attributes: [
    "sku",
    "material",
    "size",
    "color",
    "shape",
    "pile_height_mm",
    "care_instruction",
    "suitable_rooms",
    "style",
    "origin_country"
  ],
  attribute_as_label: "sku",
  attribute_requirements: {
    ecommerce: [
      "sku",
      "material",
      "size",
      "color",
      "shape",
      "pile_height_mm",
      "care_instruction",
      "suitable_rooms",
      "style",
      "origin_country"
    ]
  }
});
console.log("Upserted rug family.");

await api(accessToken, "PATCH", `/api/rest/v1/products/${identifier}`, {
  identifier,
  enabled: true,
  family: "rug",
  values: {
    material: [{ locale: null, scope: null, data: "wool" }],
    size: [{ locale: null, scope: null, data: "170x240_cm" }],
    color: [{ locale: null, scope: null, data: "sand" }],
    shape: [{ locale: null, scope: null, data: "rectangle" }],
    pile_height_mm: [{ locale: null, scope: null, data: "12" }],
    care_instruction: [
      {
        locale: "en_US",
        scope: null,
        data: `Vacuum regularly and spot clean with mild detergent. Local event seed ${updateStamp}.`
      }
    ],
    suitable_rooms: [{ locale: null, scope: null, data: ["living_room", "bedroom"] }],
    style: [{ locale: null, scope: null, data: "modern organic" }],
    origin_country: [{ locale: null, scope: null, data: "IN" }]
  }
});
console.log(`Upserted Akeneo rug product ${identifier}.`);
