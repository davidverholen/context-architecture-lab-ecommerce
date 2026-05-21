import type { ChangeRequest } from "./schemas.js";

const highRiskChangeTypes = new Set([
  "product_projection",
  "fulfillment",
  "customer_data",
  "cloud_run",
  "governance"
]);

const highRiskDomains = new Set([
  "product_projection",
  "product",
  "catalog",
  "fulfillment",
  "checkout",
  "customer",
  "customer_data",
  "governance",
  "cloud_run"
]);

function reviewGateFor(request: ChangeRequest): string {
  if (request.change_type === "product_projection" || request.affected_domains.includes("product_projection")) {
    return "product-projection-review";
  }

  if (request.change_type === "fulfillment" || request.affected_domains.includes("fulfillment")) {
    return "fulfillment-review";
  }

  if (request.change_type === "customer_data" || request.affected_domains.includes("customer_data")) {
    return "customer-data-review";
  }

  if (request.change_type === "cloud_run" || request.affected_domains.includes("cloud_run")) {
    return "cloud-run-readiness-review";
  }

  if (request.change_type === "governance" || request.affected_domains.includes("governance")) {
    return "governance-review";
  }

  return "standard-review";
}

function reviewersFor(reviewGate: string): string[] {
  switch (reviewGate) {
    case "product-projection-review":
      return ["commerce-owner", "product-data-owner"];
    case "fulfillment-review":
      return ["commerce-owner", "fulfillment-owner"];
    case "customer-data-review":
      return ["commerce-owner", "privacy-owner"];
    case "cloud-run-readiness-review":
      return ["platform-owner"];
    case "governance-review":
      return ["governance-owner"];
    default:
      return ["commerce-owner"];
  }
}

export function classifyChangeRequest(request: ChangeRequest) {
  const reviewGate = reviewGateFor(request);
  const isHighRisk =
    request.risk_level === "high" ||
    highRiskChangeTypes.has(request.change_type) ||
    request.affected_domains.some((domain) => highRiskDomains.has(domain));
  const requiresHumanReview = isHighRisk || request.requires_review || reviewGate !== "standard-review";

  return {
    decision_id: `decision-${request.change_request_id}`,
    change_request_id: request.change_request_id,
    status: requiresHumanReview ? "needs_changes" : "approved",
    review_gate: reviewGate,
    reviewers: reviewersFor(reviewGate),
    checks: [
      {
        name: "context-pack-present",
        result: request.context_pack.length > 0 ? "pass" : "fail",
        notes: "Change request includes an explicit context pack."
      },
      {
        name: "human-review-gate",
        result: requiresHumanReview ? "fail" : "not_applicable",
        notes: requiresHumanReview
          ? `Human review is required by ${reviewGate}.`
          : "No high-risk review gate was triggered."
      }
    ],
    decision_summary: requiresHumanReview
      ? `Change requires ${reviewGate} before implementation can be accepted.`
      : "Change is low risk and can proceed with standard review.",
    decided_at: new Date().toISOString(),
    required_followups: requiresHumanReview
      ? ["Attach reviewer decision before merging or applying the change."]
      : []
  } as const;
}
