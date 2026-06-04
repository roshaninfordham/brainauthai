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
- `/api/ingest-demo-pdf` parses the embedded synthetic EHR PDF with `pdf-parse` fallback.
- `/demo` displays the PDF viewer and parsed ingestion output before agent completion.
- `/api/packet` returns a valid PDF response starting with `%PDF`.
- Desktop viewport: 1440 x 900.
- Mobile viewport: 390 x 844.
- Browser console errors: none after duplicate-key fix.

## Demo Steps

1. Open `/`.
2. Click **Launch Live MVP**.
3. Click **Run Stroke Packet**.
4. Show the embedded PDF viewer and PDF ingestion output.
5. Show the agent timeline and action traces.
6. Show the warning state for missing anticoagulant history.
7. Open Evidence, Criteria Matrix, Packet Preview, Audit Trail, and FHIR JSON tabs.
8. Click **Attach Medication History** if demonstrating gap resolution.
9. Download the PDF packet.
10. Open `/copilot` for AI-assisted build proof.

## Known Limitations

- Demo data is synthetic.
- The MVP is not clinical decision support.
- Azure AI Document Intelligence is optional and only active when credentials are configured.
- FHIR output is FHIR-style and not full production FHIR conformance.
- Token and cost metrics are deterministic placeholders for observability.
- Local PDF ingestion uses open-source `pdf-parse`; Azure Document Intelligence is attempted only when credentials are configured.

## Fallback Plan

If Azure credentials are unavailable, present the deterministic local parser mode. This is the intended hackathon fallback and keeps the live demo reliable.

If browser network or localhost fails, use the README, docs, and code walkthrough to show:

- Zod schemas
- deterministic agent runner
- source-grounded facts
- hallucination safety rules
- packet PDF route
