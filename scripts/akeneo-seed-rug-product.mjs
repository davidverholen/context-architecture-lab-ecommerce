import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const akeneoDir = process.env.AKENEO_DIR ?? ".local/akeneo/pim";
const baseUrl = (process.env.AKENEO_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const username = process.env.AKENEO_USERNAME ?? "admin";
const password = process.env.AKENEO_PASSWORD ?? "admin";
const requestedIdentifier = process.env.AKENEO_RUG_SKU;
const demoCatalogPath = process.env.AKENEO_DEMO_CATALOG ?? "examples/products/akeneo-context-home-catalog.json";

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

function optionCode(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function valueEntry(data, locale = null, scope = null) {
  return [{ locale, scope, data }];
}

function displayLabel(value) {
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readDemoCatalog() {
  const rawCatalog = JSON.parse(readFileSync(demoCatalogPath, "utf8"));
  const entries = Array.isArray(rawCatalog) ? rawCatalog : [rawCatalog];
  const selected = requestedIdentifier
    ? entries.filter((entry) => entry?.product?.identifier === requestedIdentifier)
    : entries;

  if (selected.length === 0) {
    throw new Error(`No demo Akeneo product matched ${requestedIdentifier}.`);
  }

  return selected;
}

const accessToken = await token();
const demoCatalog = readDemoCatalog();

await upsertAttribute(accessToken, {
  code: "merchandising_name",
  type: "pim_catalog_text",
  group: "other",
  labels: { en_US: "Merchandising name" },
  localizable: true,
  scopable: false
});

await upsertAttribute(accessToken, {
  code: "description",
  type: "pim_catalog_textarea",
  group: "other",
  labels: { en_US: "Description" },
  localizable: true,
  scopable: false
});

await upsertAttribute(accessToken, {
  code: "price",
  type: "pim_catalog_number",
  group: "other",
  labels: { en_US: "Price" },
  localizable: false,
  scopable: false,
  decimals_allowed: true,
  negative_allowed: false
});

await upsertAttribute(accessToken, {
  code: "primary_image",
  type: "pim_catalog_text",
  group: "other",
  labels: { en_US: "Primary image asset" },
  localizable: false,
  scopable: false
});

await upsertAttribute(accessToken, {
  code: "lifestyle_image",
  type: "pim_catalog_text",
  group: "other",
  labels: { en_US: "Lifestyle image asset" },
  localizable: false,
  scopable: false
});

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

for (const productExport of demoCatalog) {
  const values = productExport.product.values;
  await upsertOption(accessToken, "material", optionCode(values.material), displayLabel(values.material));
  await upsertOption(accessToken, "color", optionCode(values.color), displayLabel(values.color));
  await upsertOption(accessToken, "size", optionCode(values.size), values.size);
  for (const room of values.suitable_rooms) {
    await upsertOption(accessToken, "suitable_rooms", optionCode(room), displayLabel(room));
  }
}

await api(accessToken, "PATCH", "/api/rest/v1/families/rug", {
  code: "rug",
  labels: {
    en_US: "Rug"
  },
  attributes: [
    "sku",
    "merchandising_name",
    "description",
    "price",
    "material",
    "size",
    "color",
    "shape",
    "pile_height_mm",
    "care_instruction",
    "suitable_rooms",
    "style",
    "origin_country",
    "primary_image",
    "lifestyle_image"
  ],
  attribute_as_label: "sku",
  attribute_requirements: {
    ecommerce: [
      "sku",
      "merchandising_name",
      "description",
      "price",
      "material",
      "size",
      "color",
      "shape",
      "pile_height_mm",
      "care_instruction",
      "suitable_rooms",
      "style",
      "origin_country",
      "primary_image",
      "lifestyle_image"
    ]
  }
});
console.log("Upserted rug family.");

for (const productExport of demoCatalog) {
  const { identifier, values } = productExport.product;
  await api(accessToken, "PATCH", `/api/rest/v1/products/${identifier}`, {
    identifier,
    enabled: productExport.product.enabled,
    family: "rug",
    values: {
      merchandising_name: valueEntry(values.merchandising_name, "en_US"),
      description: valueEntry(values.description, "en_US"),
      price: valueEntry(String(values.price)),
      material: valueEntry(optionCode(values.material)),
      size: valueEntry(optionCode(values.size)),
      color: valueEntry(optionCode(values.color)),
      shape: valueEntry(values.shape),
      pile_height_mm: valueEntry(String(values.pile_height_mm)),
      care_instruction: valueEntry(values.care_instruction, "en_US"),
      suitable_rooms: valueEntry(values.suitable_rooms.map(optionCode)),
      style: valueEntry(values.style),
      origin_country: valueEntry(values.origin_country),
      primary_image: valueEntry(values.image_assets.primary),
      lifestyle_image: valueEntry(values.image_assets.lifestyle ?? "")
    }
  });
  console.log(`Upserted Akeneo rug product ${identifier}.`);
}
