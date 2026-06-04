# BrainAuth AI Implementation Plan

## Current State

- Next.js App Router MVP runs at `/`.
- The current page is a dark mission-control dashboard with patient context, metrics, agent timeline, criteria, FHIR-style JSON, audit view, and PDF export.
- API routes exist for deterministic packet analysis and PDF generation:
  - `/api/analyze`
  - `/api/packet`
- Demo data and agent outputs live in root-level `lib/` files.
- README and initial Mermaid docs exist, but the repo does not yet have a landing page, source-grounded Zod schemas, Copilot proof artifacts, or formal hallucination-safety documentation.

## Target Architecture

```mermaid
flowchart TB
  Landing[/ Landing Page] --> Demo[/demo Live MVP]
  Demo --> Runner[Deterministic Agent Runner]
  Runner --> Tools[Agent Tool Layer]
  Tools --> Data[Source-Grounded Synthetic Records]
  Data --> Schemas[Zod Clinical and Packet Schemas]
  Runner --> Packet[Stroke Packet Output]
  Packet --> PDF[/api/packet PDF Export]
  Runner --> Audit[Audit + Verification Metrics]
  Azure[/api/azure-document Optional Azure DI] -. fallback .-> Data
```

## Task Breakdown

1. Add Copilot instructions and build-log proof artifacts.
2. Move the demo route to `/demo` and convert `/` into a polished landing page.
3. Refactor the design system from dark developer dashboard to light clinical SaaS.
4. Add Zod schemas for source evidence, facts, policy criteria, gaps, agent events, audit entries, and packets.
5. Add deterministic agent tools and runner with visible action traces.
6. Redesign `/demo` into a 90-second product workflow with patient, evidence, timeline, criteria, packet, FHIR, and audit surfaces.
7. Add Azure Document Intelligence route with truthful connected/fallback status.
8. Add observability and hallucination-safety metrics.
9. Add architecture, agents, safety, Azure, startup story, demo, Copilot, and final QA docs.
10. Run build/typecheck/audit, verify browser flows, and commit/push atomic changes.

## Risks

- LLM-like demos can appear fake if results complete instantly, so the deterministic runner should stream visible action traces with staged delays.
- Clinical claims must not imply diagnosis, treatment approval, or authorization blocking. Use "documentation readiness" and "human review required" consistently.
- Every clinical fact needs source evidence; missing fields must become gaps instead of invented facts.
- Azure must not be shown as connected unless credentials are configured.
- Route migration can break the existing demo if API result shapes change without matching UI updates.

## Fastest Implementation Sequence

1. Preserve the current demo behavior while moving it to `/demo`.
2. Introduce source-grounded schemas and data.
3. Wire the agent runner into `/api/analyze`.
4. Refactor UI components and light theme.
5. Build landing page with chart and workflow comparison.
6. Add docs and Copilot proof route.
7. Verify and push.

## Acceptance Criteria

- `/` presents BrainAuth AI as a clinical SaaS landing page.
- `/demo` runs the deterministic agent workflow repeatedly.
- Clinical output is source-grounded or marked missing/needs review.
- The app builds without Azure credentials.
- Documentation explains architecture, agents, safety, Azure usage, Copilot usage, demo script, and startup path.
