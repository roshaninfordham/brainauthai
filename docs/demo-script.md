# BrainAuth AI Demo Script

## 90-Second Demo

**Setup**

"A rural hospital identifies a suspected large-vessel stroke. The patient may need transfer for mechanical thrombectomy. Today, the team manually pulls notes, imaging reports, NIHSS, last-known-well time, contraindications, insurance details, and payer criteria."

**Run**

Click **Run Stroke Packet**.

"BrainAuth launches seven agents. Each agent researches, plans, acts, verifies, and reports. This is not just a chat response. It is an auditable workflow."

**Point Out**

- Triage Extractor finds NIHSS 18 and last-known-well 08:12 AM.
- Imaging Evidence Agent finds left M1 MCA LVO and no hemorrhage.
- Payer Policy Agent converts the policy into criteria.
- Medical Necessity Agent maps evidence to the policy.
- Gap Detector flags missing anticoagulant history.
- Packet Builder creates the letter, FHIR JSON, and PDF-ready packet.
- Audit Agent records every step and confidence score.

**Resolve Gap**

Click **Attach Medication History**.

"The missing documentation loop is the product. BrainAuth flags the exact gap before the receiving stroke center or payer asks for it, then regenerates the packet once the team attaches the missing evidence."

**Close**

"BrainAuth AI does not replace physicians, and it does not delay emergency stabilization. It removes paperwork friction around time-critical stroke care so clinicians can move faster, document better, and defend medically necessary intervention."

## Big Metric

```text
Manual packet preparation baseline: 30 minutes
BrainAuth AI packet time: 2 minutes
Time saved: 28 minutes
Estimated neurons at risk avoided: 53.2 million
```

Formula:

```text
neurons_at_risk = minutes_saved * 1,900,000
```

Use "neurons at risk avoided", not "neurons saved."
