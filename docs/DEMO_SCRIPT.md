# Demo Script

## 0:00-0:20 Problem

Every minute in an untreated ischemic stroke, about 1.9 million neurons are at risk. But around acute stroke care, teams still assemble EHR notes, CTA reports, transfer details, payer criteria, and medical-necessity documentation manually. BrainAuth AI is an agentic stroke documentation copilot that prepares a source-grounded packet draft in one run.

## 0:20-2:00 Live MVP

Open `/demo`.

John Doe is a synthetic rural-hospital stroke case: age 64, NIHSS 18, last-known-well 08:12 AM, CTA-documented left M1 MCA occlusion.

Click **Run Stroke Packet**.

Seven agents run: triage, imaging, policy, medical necessity, gap detection, packet building, and audit verification.

Point out:

- Tool calls and evidence are visible.
- Hidden chain-of-thought is not displayed.
- The Imaging Agent extracts left M1 MCA occlusion from the CTA report.
- The Policy Agent maps documentation criteria.
- The Gap Agent flags missing anticoagulant history.
- The Packet Builder prepares a clinician-review packet draft.
- The Audit Agent reports unsupported claims = 0.

Show:

- Evidence tab
- Criteria Matrix tab
- Packet Preview tab
- Audit Trail tab
- FHIR JSON tab

## 2:00-2:45 Copilot Build

Open `/copilot`.

Show:

- `.github/copilot-instructions.md`
- `docs/COPILOT_BUILD_LOG.md`
- prompt trail
- atomic commits

Say: GitHub Copilot was used as an AI pair programmer for UI refactor, schemas, agent runner, docs, and QA.

## 2:45-3:20 Azure

BrainAuth is Azure-ready through Azure AI Document Intelligence. If credentials are configured, `/api/azure-document` can parse uploaded PDFs. Without credentials, the deterministic local parser keeps the demo reliable.

## 3:20-4:00 Close

BrainAuth does not replace physicians and does not make treatment decisions. It removes documentation friction around time-critical stroke care. The beachhead is stroke packet documentation, expanding into prior-auth automation, transfer coordination, and stroke network operations.
