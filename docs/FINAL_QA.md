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
- Packet Preview, Criteria Matrix, and Evidence tabs render.
- Audit Trail and FHIR JSON render as collapsed technical drawers.
- `/copilot` proof page loads.
- `/api/azure-document` returns local fallback mode when Azure credentials are not configured.
- `/api/ingest-demo-pdf` parses the embedded synthetic EHR PDF with `pdf-parse` fallback.
- `/demo` displays the PDF viewer and parsed ingestion output before agent completion.
- `/api/packet` returns a valid PDF response starting with `%PDF`.
- `/api/export/demo-packet/pdf` returns a valid PDF response.
- `/api/export/demo-packet/text` returns a text artifact.
- `/api/vision-monitor` returns Azure-configured mode or local vision demo mode.
- B.E. FAST monitor uploads or simulates video, streams agent steps, shows signal bars, and prepares emergency-first actions.
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
7. Open Packet Preview, Criteria Matrix, Evidence, Audit Trail drawer, and FHIR JSON drawer.
8. Click **Attach Medication History** if demonstrating gap resolution.
9. Download the PDF packet.
10. Scroll to **B.E. FAST Monitoring Agent**.
11. Click **Use Demo Clip** and **Run B.E. FAST Monitor**.
12. Show emergency prompt, loved-one notification, urgent clinician callback request, and monitoring audit actions.
13. Open `/copilot` for AI-assisted build proof.

## Known Limitations

- Demo data is synthetic.
- The MVP is not clinical decision support.
- Azure AI Document Intelligence is optional and only active when credentials are configured.
- Azure AI Vision is optional and only active when credentials are configured.
- FHIR output is FHIR-style and not full production FHIR conformance.
- Token and cost metrics are deterministic placeholders for observability.
- Local PDF ingestion uses open-source `pdf-parse`; Azure Document Intelligence is attempted only when credentials are configured.
- Local B.E. FAST video monitoring uses deterministic findings; production Azure AI Vision frame analysis is the intended integration path.

## Fallback Plan

If Azure credentials are unavailable, present the deterministic local parser and local vision demo modes. This is the intended hackathon fallback and keeps the live demo reliable.

If browser network or localhost fails, use the README, docs, and code walkthrough to show:

- Zod schemas
- deterministic agent runner
- source-grounded facts
- hallucination safety rules
- packet PDF route
- B.E. FAST monitor route
