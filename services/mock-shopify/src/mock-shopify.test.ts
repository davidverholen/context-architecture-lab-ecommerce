import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "./server.js";
import sampleProjection from "../../../examples/products/shopify-rug-projection.sample.json" with { type: "json" };

let dumpDir: string;

beforeEach(async () => {
  dumpDir = await mkdtemp(path.join(os.tmpdir(), "mock-shopify-"));
});

afterEach(async () => {
  await rm(dumpDir, { recursive: true, force: true });
});

describe("mock Shopify projection target", () => {
  it("writes accepted projection dumps", async () => {
    const app = buildApp({ dumpDir });
    const response = await app.inject({
      method: "POST",
      url: "/products/projections",
      payload: sampleProjection
    });
    await app.close();

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("accepted");

    const dump = JSON.parse(await readFile(body.dump_path, "utf8"));
    expect(dump.projection_id).toBe(sampleProjection.projection_id);
  });

  it("removes projection dumps for removal commands", async () => {
    const app = buildApp({ dumpDir });
    const writeResponse = await app.inject({
      method: "POST",
      url: "/products/projections",
      payload: sampleProjection
    });
    const dumpPath = writeResponse.json().dump_path;

    const removeResponse = await app.inject({
      method: "POST",
      url: "/products/removals",
      payload: {
        removal_id: "projection-removal-test",
        source_export_id: "akeneo-event-remove-test",
        idempotency_key: "akeneo-event-remove-test:RUG-ATLAS-170X240-SAND:mock-shopify:remove",
        requested_at: "2026-05-21T08:00:00Z",
        source: "akeneo-ce",
        target: "mock-shopify",
        pim_product_id: "pim-rug-atlas-sand",
        sku: "RUG-ATLAS-170X240-SAND",
        projection_id: sampleProjection.projection_id,
        reason: "akeneo_product_removed"
      }
    });
    await app.close();

    expect(removeResponse.statusCode).toBe(200);
    expect(removeResponse.json()).toMatchObject({
      status: "accepted",
      operation: "delete",
      removed: true
    });
    await expect(stat(dumpPath)).rejects.toThrow();
  });
});
