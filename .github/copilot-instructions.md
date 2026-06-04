# GitHub Copilot Instructions

## Product Positioning

BrainAuth AI prepares clinician-reviewed documentation packets for acute stroke transfer and payer-submission workflows. It does not approve care, deny care, replace clinicians, make treatment decisions, or delay emergency screening and stabilization.

Use this safe framing:

> BrainAuth AI prepares the clinical evidence packet, transfer summary, payer-submission documentation draft, and audit trail around acute stroke care so clinicians do not lose time assembling paperwork while the patient's brain is at risk.

## UI Style

- Use a light clinical SaaS interface.
- Prefer white cards, slate text, blue primary actions, purple agent accents, and restrained success/warning/danger states.
- Use `lucide-react` icons only.
- Avoid cartoon graphics, hidden developer panels, and dark dashboard styling except for JSON/code previews.
- Keep motion minimal and purposeful.

## Agent UX

- Show visible action traces: tool call, evidence found, confidence, source, verification, and human-review flags.
- Never show hidden chain-of-thought, private reasoning, or "the AI believes/decided" language.
- Use workflow state labels such as `Extracted`, `Mapped`, `Checked`, `Flagged`, `Prepared`, and `Verified`.

## Data Safety

- Synthetic data only.
- No PHI.
- Every clinical fact must map to source evidence or be marked missing/needs review.
- Missing fields become documentation gaps. Do not invent values.
- Unsupported clinical claims must be blocked from packet export.

## Code Rules

- Keep TypeScript strict.
- Use Zod schemas for clinical, packet, audit, and agent contracts.
- Prefer small, readable components and deterministic demo behavior.
- Avoid unnecessary dependencies.
- Keep Azure optional and truthful: show connected state only when environment variables exist.

## Testing

Run the strongest available checks before finalizing:

```bash
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Commits

Use atomic conventional commits. Commit messages should describe the actual scope.
