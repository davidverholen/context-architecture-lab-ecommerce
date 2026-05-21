import { readFile } from "node:fs/promises";

const bridgeUrl = process.env.AKENEO_EVENT_BRIDGE_URL ?? "http://localhost:8090";
const samplePath = process.env.AKENEO_SAMPLE_EVENT ?? "examples/products/akeneo-webhook-product-updated.sample.json";
const payload = JSON.parse(await readFile(samplePath, "utf8"));

const response = await fetch(`${bridgeUrl.replace(/\/$/, "")}/akeneo/events`, {
  method: "POST",
  headers: {
    "content-type": "application/json"
  },
  body: JSON.stringify(payload)
});

const body = await response.text();
console.log(body);

if (!response.ok) {
  process.exit(1);
}
