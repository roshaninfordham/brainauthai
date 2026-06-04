# Final QA

## Commands Run

```bash
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Browser Verification

Verified with Playwright:

- `/` landing page loads.
- `/demo` live MVP loads.
- `Run Stroke Packet` can complete.
- Evidence, Criteria Matrix, Packet Preview, Audit Trail, and FHIR JSON tabs render.
- `/copilot` proof page loads.
- `/api/azure-document` returns local fallback mode when Azure credentials are not configured.
- `/api/packet` returns a valid PDF response starting with `%PDF`.
- Desktop viewport: 1440 x 900.
- Mobile viewport: 390 x 844.
- Browser console errors: none after duplicate-key fix.

## Demo Steps

1. Open `/`.
2. Click **Launch Live MVP**.
3. Click **Run Stroke Packet**.
4. Show the agent timeline and action traces.
5. Show the warning state for missing anticoagulant history.
6. Open Evidence, Criteria Matrix, Packet Preview, Audit Trail, and FHIR JSON tabs.
7. Click **Attach Medication History** if demonstrating gap resolution.
8. Download the PDF packet.
9. Open `/copilot` for AI-assisted build proof.

## Known Limitations

- Demo data is synthetic.
- The MVP is not clinical decision support.
- Azure AI Document Intelligence is optional and only active when credentials are configured.
- FHIR output is FHIR-style and not full production FHIR conformance.
- Token and cost metrics are deterministic placeholders for observability.

## Fallback Plan

If Azure credentials are unavailable, present the deterministic local parser mode. This is the intended hackathon fallback and keeps the live demo reliable.

If browser network or localhost fails, use the README, docs, and code walkthrough to show:

- Zod schemas
- deterministic agent runner
- source-grounded facts
- hallucination safety rules
- packet PDF route
