import { describe, expect, it } from "vitest";
import { classifyChangeRequest } from "../../shared/governance.js";
import type { ChangeRequest } from "../../shared/schemas.js";

describe("governance classification", () => {
  it("requires product projection changes to pass the product projection review gate", () => {
    const request: ChangeRequest = {
      change_request_id: "cr-product-projection-001",
      title: "Adjust rug projection metafields",
      change_type: "product_projection",
      affected_domains: ["product_projection", "shopify"],
      risk_level: "medium",
      summary: "Change how rug care attributes project into Shopify metafields.",
      proposed_by: "codex",
      requires_review: true,
      context_pack: [
        "docs/commerce/akeneo-to-shopify-projection.md",
        "docs/checklists/shopify-change-checklist.md"
      ],
      created_at: "2026-05-18T12:00:00Z"
    };

    const decision = classifyChangeRequest(request);

    expect(decision.status).toBe("needs_changes");
    expect(decision.review_gate).toBe("product-projection-review");
    expect(decision.reviewers).toContain("product-data-owner");
    expect(decision.required_followups).toContain(
      "Attach reviewer decision before merging or applying the change."
    );
  });
});
