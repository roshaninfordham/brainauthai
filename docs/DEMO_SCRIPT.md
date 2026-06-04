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

- Criteria Matrix tab
- Packet Preview tab
- Evidence tab
- Collapsed Audit Trail drawer
- Collapsed FHIR JSON drawer
- Packet artifact downloads: PDF, Verdict TXT, Letter TXT, FHIR JSON

## 2:00-2:35 B.E. FAST Monitor

Scroll to **B.E. FAST Monitoring Agent**.

Say: This is the expansion from acute packet readiness into pre/post monitoring. Stroke symptoms appear suddenly, so the monitor uses B.E. FAST: Balance, Eyes, Face, Arms, Speech, and Time.

Click **Use Demo Clip**, then **Run B.E. FAST Monitor**.

Point out:

- The upload button is visible for a real symptom video.
- The video frame overlay shows what the vision monitor is sampling.
- The Azure AI Vision adapter is truthfully labeled as configured or local demo mode.
- Agents stream with visible 1-2 second steps.
- The system fuses video warning signals with EHR risk context.
- It prepares emergency-first actions: call emergency services, notify loved one, request urgent stroke clinician callback, and save an audit.

Say: This is not a diagnosis and does not tell someone to wait for a routine appointment. Sudden B.E. FAST symptoms mean emergency medical attention now.

## 2:35-3:05 Copilot Build

Open `/copilot`.

Show:

- `.github/copilot-instructions.md`
- `docs/COPILOT_BUILD_LOG.md`
- prompt trail
- atomic commits

Say: GitHub Copilot was used as an AI pair programmer for UI refactor, schemas, agent runner, docs, and QA.

## 3:05-3:35 Azure

BrainAuth is Azure-ready through Azure AI Document Intelligence for PDFs and Azure AI Vision for B.E. FAST video frame monitoring. If credentials are configured, the app reports configured mode. Without credentials, deterministic local fallbacks keep the live demo reliable.

## 3:35-4:00 Close

BrainAuth does not replace physicians and does not make treatment decisions. It removes documentation friction around time-critical stroke care and extends into emergency-first monitoring workflows. The beachhead is stroke packet documentation, expanding into prior-auth automation, transfer coordination, B.E. FAST monitoring, and stroke network operations.
