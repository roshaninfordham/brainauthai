import { getAzureDocumentIntelligenceStatus } from "./azureDocumentIntelligence";
import { sourceLinks } from "./sample-case";
import type {
  AgentRun,
  AnalysisResult,
  AuditEvent,
  CriteriaMatch,
  DocumentationGap,
  FhirPacket,
  PatientFact
} from "./types";

const baseTimestamp = "2026-06-04T09:31:12.000-04:00";

function confidence(value: number) {
  return Math.round(value * 100) / 100;
}

function audit(
  offsetSeconds: number,
  agent: string,
  action: string,
  result: string,
  confidenceScore: number
): AuditEvent {
  const at = new Date(new Date(baseTimestamp).getTime() + offsetSeconds * 1000);
  return {
    at: at.toISOString(),
    agent,
    action,
    result,
    confidence: confidence(confidenceScore)
  };
}

function fhirPacket(includeMedicationHistory: boolean): FhirPacket {
  return {
    resourceType: "Bundle",
    type: "document",
    id: "brainauth-stroke-john-doe-001",
    timestamp: new Date(baseTimestamp).toISOString(),
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: "patient-john-doe",
          name: [{ text: "John Doe" }],
          gender: "male",
          age: 64
        }
      },
      {
        resource: {
          resourceType: "Observation",
          id: "nihss-18",
          code: { text: "NIH Stroke Scale" },
          valueInteger: 18,
          interpretation: [{ code: "high-acuity" }]
        }
      },
      {
        resource: {
          resourceType: "DiagnosticReport",
          id: "cta-left-m1-lvo",
          conclusion:
            "CTA confirms left M1 middle cerebral artery large-vessel occlusion; CT excludes hemorrhage; ASPECTS 8."
        }
      },
      {
        resource: {
          resourceType: "ServiceRequest",
          id: "transfer-thrombectomy-eval",
          intent: "order",
          priority: "stat",
          status: includeMedicationHistory ? "active" : "on-hold",
          reasonCode: [{ text: "Endovascular thrombectomy evaluation" }]
        }
      },
      {
        resource: {
          resourceType: "List",
          id: "documentation-gaps",
          title: "Authorization readiness gaps",
          item: includeMedicationHistory
            ? [{ display: "No critical documentation gaps remain." }]
            : [{ display: "Medication and anticoagulant history requires attestation." }]
        }
      }
    ]
  };
}

function medicalNecessityLetter(includeMedicationHistory: boolean) {
  const medicationLine = includeMedicationHistory
    ? "Medication reconciliation confirms no active anticoagulant use and no documented contraindication to transfer for endovascular evaluation."
    : "Medication and anticoagulant history are not yet fully attested and are flagged for clinician completion before packet submission.";

  return `To the receiving stroke center and utilization review team:

BrainAuth AI generated this authorization-ready clinical documentation packet for urgent review by the treating clinician.

John Doe is a 64-year-old male presenting from a rural emergency department with disabling acute ischemic stroke symptoms. Last-known-well time is documented as 08:12 AM, NIHSS is 18, and CTA demonstrates a left M1 middle cerebral artery large-vessel occlusion. Non-contrast CT excludes acute intracranial hemorrhage and ASPECTS is 8. The patient has baseline functional independence documented as modified Rankin score 1.

The documented clinical evidence supports urgent transfer to a thrombectomy-capable comprehensive stroke center for endovascular evaluation. This packet does not delay emergency screening or stabilization; it assembles documentation, medical-necessity evidence, payer criteria alignment, transfer summary, and audit history around the acute stroke workflow.

${medicationLine}

Recommended disposition: clinician-reviewed transfer and endovascular thrombectomy evaluation packet.`;
}

function buildAgents(includeMedicationHistory: boolean): AgentRun[] {
  const gapDetail = includeMedicationHistory
    ? "Medication reconciliation attached; no critical packet blockers remain."
    : "Missing anticoagulant history attestation flagged as a critical packet gap.";

  return [
    {
      id: "triage-extractor",
      name: "Triage Extractor Agent",
      purpose: "Extract NIHSS, last-known-well, symptoms, vitals, contraindications.",
      status: "complete",
      durationMs: 820,
      tokens: 1840,
      costUsd: 0.006,
      confidence: 0.94,
      steps: [
        { phase: "Research", detail: "Read ED note and transfer summary.", confidence: 0.93 },
        { phase: "Plan", detail: "Target time-critical stroke facts and contraindication fields.", confidence: 0.93 },
        { phase: "Act", detail: "Extracted NIHSS 18 and last-known-well 08:12 AM.", confidence: 0.95 },
        { phase: "Verify", detail: "Cross-checked arrival, symptoms, glucose, and baseline mRS.", confidence: 0.94 },
        { phase: "Report", detail: "Patient classified as critical suspected LVO stroke.", confidence: 0.94 }
      ]
    },
    {
      id: "imaging-evidence",
      name: "Imaging Evidence Agent",
      purpose: "Extract CTA/CT findings: LVO, vessel territory, hemorrhage exclusion.",
      status: "complete",
      durationMs: 910,
      tokens: 2160,
      costUsd: 0.007,
      confidence: 0.96,
      steps: [
        { phase: "Research", detail: "Parsed CT head and CTA head/neck report.", confidence: 0.95 },
        { phase: "Plan", detail: "Identify hemorrhage exclusion, ASPECTS, and vessel target.", confidence: 0.95 },
        { phase: "Act", detail: "Found left M1 MCA occlusion with ASPECTS 8.", confidence: 0.97 },
        { phase: "Verify", detail: "Confirmed no acute intracranial hemorrhage.", confidence: 0.97 },
        { phase: "Report", detail: "Imaging supports endovascular thrombectomy evaluation.", confidence: 0.96 }
      ]
    },
    {
      id: "payer-policy",
      name: "Payer Policy Agent",
      purpose: "Convert payer policy PDF language into checklist criteria.",
      status: "complete",
      durationMs: 760,
      tokens: 1780,
      costUsd: 0.005,
      confidence: 0.91,
      steps: [
        { phase: "Research", detail: "Read policy criteria for emergent thrombectomy review.", confidence: 0.9 },
        { phase: "Plan", detail: "Normalize requirements into auditable yes/no checklist.", confidence: 0.9 },
        { phase: "Act", detail: "Extracted NIHSS, LKW, LVO, hemorrhage, mRS, medication, and attestation criteria.", confidence: 0.92 },
        { phase: "Verify", detail: "Marked payer language as authorization-ready, not treatment-blocking.", confidence: 0.92 },
        { phase: "Report", detail: "Generated seven-point payer criteria checklist.", confidence: 0.91 }
      ]
    },
    {
      id: "medical-necessity",
      name: "Medical Necessity Agent",
      purpose: "Map patient facts to payer requirements and clinical rationale.",
      status: "complete",
      durationMs: 870,
      tokens: 2420,
      costUsd: 0.009,
      confidence: 0.93,
      steps: [
        { phase: "Research", detail: "Compared extracted facts against payer checklist.", confidence: 0.93 },
        { phase: "Plan", detail: "Separate met evidence from fields requiring clinician attestation.", confidence: 0.93 },
        { phase: "Act", detail: "Matched disabling stroke, NIHSS, LKW, CTA LVO, CT hemorrhage exclusion, and transfer need.", confidence: 0.94 },
        { phase: "Verify", detail: "Checked that emergency stabilization caveat is preserved.", confidence: 0.94 },
        { phase: "Report", detail: "Prepared clinician-review medical necessity rationale.", confidence: 0.93 }
      ]
    },
    {
      id: "gap-detector",
      name: "Gap Detector Agent",
      purpose: "Flag missing or weak documentation before payer or receiving center asks.",
      status: includeMedicationHistory ? "complete" : "warning",
      durationMs: 690,
      tokens: 1260,
      costUsd: 0.004,
      confidence: includeMedicationHistory ? 0.94 : 0.9,
      steps: [
        { phase: "Research", detail: "Scanned packet for absent clinical and administrative fields.", confidence: 0.91 },
        { phase: "Plan", detail: "Rank gaps by transfer and authorization-readiness risk.", confidence: 0.91 },
        { phase: "Act", detail: gapDetail, confidence: includeMedicationHistory ? 0.94 : 0.89 },
        { phase: "Verify", detail: "Confirmed CTA report, NIHSS, LKW, and transfer note are present.", confidence: 0.92 },
        { phase: "Report", detail: "Generated owner-based documentation checklist.", confidence: includeMedicationHistory ? 0.94 : 0.9 }
      ]
    },
    {
      id: "packet-builder",
      name: "Packet Builder Agent",
      purpose: "Generate packet, FHIR-style JSON, and medical necessity letter.",
      status: "complete",
      durationMs: 1040,
      tokens: 3280,
      costUsd: 0.011,
      confidence: includeMedicationHistory ? 0.95 : 0.91,
      steps: [
        { phase: "Research", detail: "Collected facts, criteria results, and gap checklist.", confidence: 0.92 },
        { phase: "Plan", detail: "Assemble packet sections for clinician review and transfer handoff.", confidence: 0.92 },
        { phase: "Act", detail: "Generated medical necessity letter and FHIR-style JSON bundle.", confidence: 0.93 },
        { phase: "Verify", detail: "Validated packet includes evidence, caveat, and audit trail.", confidence: includeMedicationHistory ? 0.96 : 0.91 },
        { phase: "Report", detail: "Packet is ready for human review and PDF export.", confidence: includeMedicationHistory ? 0.95 : 0.91 }
      ]
    },
    {
      id: "audit",
      name: "Audit Agent",
      purpose: "Log every extraction, decision, confidence score, and missing field.",
      status: "complete",
      durationMs: 610,
      tokens: 980,
      costUsd: 0.003,
      confidence: 0.95,
      steps: [
        { phase: "Research", detail: "Reviewed agent outputs for traceability.", confidence: 0.94 },
        { phase: "Plan", detail: "Create chronological extraction and decision log.", confidence: 0.94 },
        { phase: "Act", detail: "Recorded sources, confidence scores, and packet status.", confidence: 0.95 },
        { phase: "Verify", detail: "Confirmed no autonomous treatment recommendation is issued.", confidence: 0.96 },
        { phase: "Report", detail: "Audit trail ready for demo and compliance review.", confidence: 0.95 }
      ]
    }
  ];
}

export function buildAnalysis(includeMedicationHistory = false): AnalysisResult {
  const azureStatus = getAzureDocumentIntelligenceStatus();
  const agents = buildAgents(includeMedicationHistory);
  const gaps: DocumentationGap[] = includeMedicationHistory
    ? [
        {
          item: "Receiving center callback time",
          severity: "low",
          action: "Add timestamp when transfer center confirms final bed assignment.",
          owner: "Transfer coordinator"
        }
      ]
    : [
        {
          item: "Medication and anticoagulant history",
          severity: "critical",
          action: "Attach medication reconciliation or clinician attestation before packet submission.",
          owner: "ED clinician"
        },
        {
          item: "Receiving center callback time",
          severity: "low",
          action: "Add timestamp when transfer center confirms final bed assignment.",
          owner: "Transfer coordinator"
        }
      ];

  const criteria: CriteriaMatch[] = [
    {
      criterion: "Disabling acute ischemic stroke documented",
      status: "met",
      evidence: "Aphasia, dense right arm weakness, right facial droop; NIHSS 18.",
      confidence: 0.95
    },
    {
      criterion: "NIHSS threshold met",
      status: "met",
      evidence: "NIHSS = 18, above common payer threshold of 6.",
      confidence: 0.96
    },
    {
      criterion: "Last-known-well available",
      status: "met",
      evidence: "Last known well documented at 08:12 AM.",
      confidence: 0.94
    },
    {
      criterion: "CTA evidence of anterior circulation LVO",
      status: "met",
      evidence: "CTA: left M1 middle cerebral artery occlusion.",
      confidence: 0.97
    },
    {
      criterion: "Hemorrhage excluded",
      status: "met",
      evidence: "Non-contrast CT: no acute intracranial hemorrhage.",
      confidence: 0.97
    },
    {
      criterion: "Baseline functional status documented",
      status: "met",
      evidence: "Baseline modified Rankin score documented as 1.",
      confidence: 0.91
    },
    {
      criterion: "Medication / anticoagulant history reviewed",
      status: includeMedicationHistory ? "met" : "missing",
      evidence: includeMedicationHistory
        ? "Medication reconciliation attached; no active anticoagulant use documented."
        : "Home medication history absent from current packet.",
      confidence: includeMedicationHistory ? 0.94 : 0.82
    },
    {
      criterion: "Transfer note and physician attestation included",
      status: "review",
      evidence: "Transfer note present; final treating physician signature required before submission.",
      confidence: 0.88
    }
  ];

  const facts: PatientFact[] = [
    { label: "Patient", value: "John Doe, 64M", confidence: 0.96, source: "EHR note" },
    { label: "Facility", value: "Rural community ED", confidence: 0.9, source: "Transfer note" },
    { label: "NIHSS", value: "18", confidence: 0.96, source: "EHR note" },
    { label: "Last Known Well", value: "08:12 AM", confidence: 0.94, source: "EHR note" },
    { label: "CTA finding", value: "Left M1 MCA LVO", confidence: 0.97, source: "CTA report" },
    { label: "Hemorrhage", value: "Excluded on CT", confidence: 0.97, source: "CT report" },
    { label: "ASPECTS", value: "8", confidence: 0.92, source: "CT report" },
    {
      label: "Medication history",
      value: includeMedicationHistory ? "No active anticoagulant documented" : "Missing attestation",
      confidence: includeMedicationHistory ? 0.94 : 0.82,
      source: includeMedicationHistory ? "Medication reconciliation" : "Gap detector"
    }
  ];

  const auditEvents: AuditEvent[] = [
    audit(0, "Triage Extractor Agent", "Extract facts", "NIHSS 18, LKW 08:12, disabling symptoms", 0.95),
    audit(2, "Imaging Evidence Agent", "Extract imaging", "Left M1 LVO, no hemorrhage, ASPECTS 8", 0.97),
    audit(4, "Payer Policy Agent", "Normalize policy", "Seven criteria generated", 0.91),
    audit(6, "Medical Necessity Agent", "Map evidence", "Six criteria met, one review item, one medication gap", 0.93),
    audit(
      8,
      "Gap Detector Agent",
      "Detect gaps",
      includeMedicationHistory ? "Medication gap resolved" : "Anticoagulant history missing",
      includeMedicationHistory ? 0.94 : 0.9
    ),
    audit(10, "Packet Builder Agent", "Build artifacts", "Letter, FHIR JSON, PDF-ready packet", 0.93),
    audit(12, "Audit Agent", "Verify claims", "Emergency stabilization caveat preserved", 0.96)
  ];

  const manualMinutes = 30;
  const brainAuthMinutes = 2;
  const minutesSaved = manualMinutes - brainAuthMinutes;
  const neuronsAtRiskAvoided = minutesSaved * 1900000;
  const readinessScore = includeMedicationHistory ? 96 : 84;

  return {
    runId: includeMedicationHistory ? "BA-2026-0604-002" : "BA-2026-0604-001",
    generatedAt: new Date(baseTimestamp).toISOString(),
    mode: azureStatus.mode,
    patient: {
      name: "John Doe",
      age: 64,
      sex: "M",
      facility: "Rural Community ED",
      payer: "Northstar Commercial",
      status: "Critical suspected LVO"
    },
    facts,
    criteria,
    gaps,
    agents,
    audit: auditEvents,
    packet: {
      manualMinutes,
      brainAuthMinutes,
      minutesSaved,
      neuronsAtRiskAvoided,
      readinessScore,
      disposition:
        "Authorization-ready transfer packet for clinician review and comprehensive stroke center handoff.",
      medicalNecessityLetter: medicalNecessityLetter(includeMedicationHistory),
      fhirPacket: fhirPacket(includeMedicationHistory)
    },
    sources: sourceLinks
  };
}
