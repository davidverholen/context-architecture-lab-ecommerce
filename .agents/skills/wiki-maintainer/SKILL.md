---
name: wiki-maintainer
description: Use when extracting stable knowledge from sources, whitepaper content, ADRs, implementation learnings, and architecture changes into curated repository docs, including the human-readable docs/overview layer.
---

# Wiki Maintainer

## When To Use

Use this skill when updating curated Markdown memory from source material, ADRs, implementation results, architecture changes, or repeated learnings.

Also use it when maintaining `docs/overview`, the human-readable architecture overview space.

## Rules

- Do not copy long source passages.
- Preserve uncertainty.
- Add open questions when evidence is incomplete.
- Keep raw sources in `sources/`.
- Keep local docs concise and project-specific.
- Keep `docs/overview` readable first: it is a map for humans, not a second source of truth.
- In human-readable docs, use direct Markdown links for referenced documents instead of bare file names or instructions like "read this file".
- Use arc42-inspired structure for overview docs where useful: goals, constraints, context, building blocks, runtime, deployment, decisions, risks.
- Use C4-style Mermaid diagrams where they clarify system context, containers, runtime flows, or deployment topology.
- Link to ADRs, schemas, service READMEs, source references, and context docs instead of duplicating detail.
- Update overview docs when service boundaries, runtime flows, deployment topology, ADRs, or durable project rules change.
- Propose `AGENTS.md` changes for stable repeated rules.

## Expected Output Format

- Source or learning:
- Stable knowledge extracted:
- Uncertainty preserved:
- Docs updated:
- Open questions added:
- Overview impact:
- Proposed instruction changes:

## References

- `docs/context/durable-memory.md`
- `docs/context/learning-loops.md`
- `docs/context/open-questions.md`
- `docs/overview/index.md`
- `docs/README.md`
- `sources/README.md`
