import { getAzureDocumentIntelligenceStatus } from "../azureDocumentIntelligence";
import { demoDocuments, evidence } from "../data/demoCase";
import { sourceLinks } from "../data/stats";
import { AnalysisResultSchema, type AnalysisResult, type FhirPacket } from "../schemas/packet";
import type { AgentEvent, AgentRun, ObservabilityMetrics } from "../schemas/audit";
import { detectDocumentationGaps, extractClinicalFacts, matchPolicyCriteria } from "./tools";
import { auditFromAgents } from "./events";

const baseTimestamp = "2026-06-04T09:31:12.000-04:00";

export function runBrainAuthAnalysis(includeMedicationHistory = false): AnalysisResult {
  const azureStatus = getAzureDocumentIntelligenceStatus();
  const facts = extractClinicalFacts(includeMedicationHistory);
  const criteria = matchPolicyCriteria(includeMedicationHistory);
  const gaps = detectDocumentationGaps(includeMedicationHistory);
  const agents = buildAgents(includeMedicationHistory);
  const events = buildEvents(agents);
  const audit = auditFromAgents(agents, baseTimestamp);
  const packet = buildPacket(includeMedicationHistory);
  const metrics = buildMetrics(agents, criteria, gaps, packet.readinessScore, includeMedicationHistory);

  return AnalysisResultSchema.parse({
    runId: includeMedicationHistory ? "BA-2026-0604-002" : "BA-2026-0604-001",
    generatedAt: new Date(baseTimestamp).toISOString(),
    mode: azureStatus.mode,
    patient: {
      name: "John Doe",
      age: 64,
      sex: "M",
      facility: "Rural Community ED",
      payer: "Northstar Commercial",
      status: "Critical suspected LVO documentation case"
    },
    facts,
    criteria,
    gaps,
    agents,
    events,
    audit,
    metrics,
    packet,
    sources: sourceLinks
  });
}

function buildAgents(includeMedicationHistory: boolean): AgentRun[] {
  const medicationDetail = includeMedicationHistory
    ? "Medication reconciliation attached; no critical documentation gaps remain."
    : "Anticoagulant history not documented; human review item created.";

  return [
    agent("triage-extractor", "Triage Extractor Agent", "Extract age, NIHSS, LKW, symptoms, vitals, and baseline function.", 820, 1840, 0.006, 0.94, [
      step("Extracted", "NIHSS 18 and last-known-well 08:12 AM extracted from ED note.", 0.95, "parse_ehr_note", [evidence.nihss, evidence.lkw]),
      step("Checked", "Glucose, blood pressure, symptoms, and baseline mRS cross-checked against source quotes.", 0.94, "verify_grounding", [
        evidence.glucose,
        evidence.bloodPressure,
        evidence.symptoms,
        evidence.mrs
      ]),
      step("Prepared", "Triage facts prepared for clinician-review packet.", 0.94, "prepare_fact_table", [evidence.age, evidence.nihss])
    ]),
    agent("imaging-evidence", "Imaging Evidence Agent", "Map CT/CTA evidence, LVO, vessel territory, hemorrhage exclusion, and ASPECTS.", 910, 2160, 0.007, 0.96, [
      step("Extracted", "CTA report documents left M1 MCA occlusion.", 0.97, "analyze_cta_report", [evidence.lvo]),
      step("Checked", "CT report documents no acute intracranial hemorrhage and ASPECTS 8.", 0.97, "verify_imaging_sources", [
        evidence.hemorrhage,
        evidence.aspects
      ]),
      step("Prepared", "Imaging evidence prepared for transfer documentation review.", 0.96, "prepare_imaging_evidence", [
        evidence.lvo,
        evidence.hemorrhage
      ])
    ]),
    agent("policy-criteria", "Policy Criteria Agent", "Convert synthetic payer policy into criteria documentation view.", 760, 1780, 0.005, 0.91, [
      step("Mapped", "Policy criteria normalized into eight auditable documentation requirements.", 0.91, "read_payer_policy", [
        evidence.payerPolicy
      ]),
      step("Checked", "Policy language marked as documentation support, not treatment-blocking.", 0.92, "verify_policy_caveat", [
        evidence.payerPolicy
      ]),
      step("Prepared", "Criteria matrix prepared with source policy quote.", 0.91, "prepare_criteria_matrix", [evidence.payerPolicy])
    ]),
    agent("medical-necessity", "Medical Necessity Agent", "Map extracted facts to policy criteria without unsupported claims.", 870, 2420, 0.009, 0.93, [
      step("Mapped", "Patient facts mapped to adult, deficit, LKW, LVO, hemorrhage, and imaging criteria.", 0.94, "match_policy_criteria", [
        evidence.age,
        evidence.symptoms,
        evidence.nihss,
        evidence.lvo,
        evidence.hemorrhage
      ]),
      step("Checked", "Unsupported clinical claims check returned zero unsupported claims.", 0.95, "verify_grounding", []),
      step("Prepared", "Medical necessity draft prepared for treating clinician review.", 0.93, "prepare_medical_necessity_draft", [
        evidence.nihss,
        evidence.lvo
      ])
    ]),
    agent(
      "gap-detector",
      "Gap Detector Agent",
      "Flag missing or weak documentation before submission review.",
      690,
      1260,
      0.004,
      includeMedicationHistory ? 0.94 : 0.9,
      [
        step("Checked", "CTA report, NIHSS, LKW, and transfer note are present.", 0.92, "detect_documentation_gaps", [
          evidence.lvo,
          evidence.nihss,
          evidence.lkw,
          evidence.transfer
        ]),
        step("Flagged", medicationDetail, includeMedicationHistory ? 0.94 : 0.89, "detect_documentation_gaps", includeMedicationHistory ? [
          evidence.medicationPresent
        ] : [evidence.payerPolicy]),
        step("Prepared", "Owner-based documentation checklist prepared.", includeMedicationHistory ? 0.94 : 0.9, "prepare_gap_checklist", [
          evidence.receivingCallbackMissing
        ])
      ],
      includeMedicationHistory ? "complete" : "warning"
    ),
    agent("packet-builder", "Packet Builder Agent", "Prepare packet draft, FHIR-style JSON, and medical necessity draft.", 1040, 3280, 0.011, includeMedicationHistory ? 0.95 : 0.91, [
      step("Prepared", "Clinician-review packet draft, letter, and FHIR-style JSON generated.", 0.93, "build_packet", [
        evidence.age,
        evidence.nihss,
        evidence.lvo,
        evidence.hemorrhage
      ]),
      step("Checked", "Packet includes caveat that emergency stabilization is not delayed.", 0.96, "verify_packet_caveat", []),
      step("Verified", "Packet export allowed because unsupported claims count is zero.", includeMedicationHistory ? 0.96 : 0.91, "verify_grounding", [])
    ]),
    agent("audit", "Audit Verification Agent", "Check extracted facts, sources, confidence, gaps, and unsupported claims.", 610, 980, 0.003, 0.95, [
      step("Checked", "Every included clinical fact has at least one source quote.", 0.95, "verify_source_coverage", []),
      step("Checked", "Low-confidence or missing fields are marked for human review.", 0.95, "verify_review_flags", [
        evidence.receivingCallbackMissing
      ]),
      step("Verified", "Unsupported claims: 0.", 0.96, "verify_grounding", [])
    ])
  ];
}

function buildPacket(includeMedicationHistory: boolean) {
  const manualMinutes = 30;
  const brainAuthMinutes = 2;
  const minutesSaved = manualMinutes - brainAuthMinutes;
  const medicationLine = includeMedicationHistory
    ? "Medication reconciliation addendum documents no active anticoagulant use."
    : "Medication and anticoagulant history are not documented in the current packet and require clinician review.";

  const medicalNecessityLetter = `To the receiving stroke center and utilization review team:

BrainAuth AI prepared this clinical documentation draft for treating clinician review.

Source records document John Doe as a 64-year-old male with last-known-well time 08:12 AM, NIHSS 18, disabling symptoms, CTA evidence of left M1 middle cerebral artery occlusion, CT exclusion of acute intracranial hemorrhage, and ASPECTS 8.

These source-grounded findings may support clinician review for transfer and endovascular thrombectomy evaluation documentation. BrainAuth AI does not diagnose, order treatment, approve care, or delay emergency screening and stabilization.

${medicationLine}

Draft packet purpose: support clinician review for transfer and payer-submission documentation. Physician review and signoff are required before submission.`;

  return {
    manualMinutes,
    brainAuthMinutes,
    minutesSaved,
    neuronsAtRiskAvoided: minutesSaved * 1900000,
    readinessScore: includeMedicationHistory ? 96 : 84,
    disposition: "Transfer and payer-submission documentation draft prepared for clinician review.",
    medicalNecessityLetter,
    medicalNecessityDraft: {
      text: medicalNecessityLetter,
      sourceRefs: [
        evidence.age,
        evidence.lkw,
        evidence.nihss,
        evidence.symptoms,
        evidence.lvo,
        evidence.hemorrhage,
        evidence.aspects,
        ...(includeMedicationHistory ? [evidence.medicationPresent] : [])
      ],
      requiresClinicianSignature: true
    },
    fhirPacket: fhirPacket(includeMedicationHistory),
    blockers: includeMedicationHistory ? [] : ["Medication and anticoagulant history requires clinician attestation."],
    unsupportedClaims: 0
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
          status: "preliminary",
          sourceEvidenceId: "evidence-nihss"
        }
      },
      {
        resource: {
          resourceType: "DiagnosticReport",
          id: "cta-left-m1-lvo",
          conclusion:
            "CTA source text documents left M1 middle cerebral artery occlusion; CT source text documents no acute intracranial hemorrhage; ASPECTS 8.",
          sourceEvidenceIds: ["evidence-lvo", "evidence-hemorrhage", "evidence-aspects"]
        }
      },
      {
        resource: {
          resourceType: "DocumentReference",
          id: "brainauth-review-packet-draft",
          status: "current",
          docStatus: "preliminary",
          description:
            "BrainAuth AI transfer and payer-submission documentation draft for treating clinician review.",
          requiresClinicianSignature: true
        }
      },
      {
        resource: {
          resourceType: "List",
          id: "documentation-gaps",
          title: "Documentation gaps for human review",
          item: includeMedicationHistory
            ? [{ display: "No critical documentation gaps remain." }]
            : [{ display: "Medication and anticoagulant history requires clinician attestation." }]
        }
      }
    ]
  };
}

function buildMetrics(
  agents: AgentRun[],
  criteria: ReturnType<typeof matchPolicyCriteria>,
  gaps: ReturnType<typeof detectDocumentationGaps>,
  readinessScore: number,
  includeMedicationHistory: boolean
): ObservabilityMetrics {
  const totalDurationMs = agents.reduce((sum, agentRun) => sum + agentRun.durationMs, 0);
  const totalTokens = agents.reduce((sum, agentRun) => sum + agentRun.tokens, 0);
  const totalCostUsd = agents.reduce((sum, agentRun) => sum + agentRun.costUsd, 0);
  const averageConfidence =
    agents.reduce((sum, agentRun) => sum + agentRun.confidence, 0) / Math.max(agents.length, 1);

  return {
    totalDurationMs,
    totalTokens,
    totalCostUsd,
    averageConfidence: Math.round(averageConfidence * 100) / 100,
    evidenceCoveragePct: includeMedicationHistory ? 98 : 92,
    unsupportedClaims: 0,
    humanReviewItems: gaps.length,
    documentsParsed: includeMedicationHistory ? demoDocuments.length : demoDocuments.length - 1,
    criteriaMatched: criteria.filter((criterion) => criterion.status === "met").length,
    gapsFound: gaps.length
  };
}

function buildEvents(agents: AgentRun[]): AgentEvent[] {
  const start = new Date(baseTimestamp).getTime();
  let index = 0;
  return agents.flatMap((agentRun) =>
    agentRun.steps.map((step) => {
      index += 1;
      return {
        id: `event-${index.toString().padStart(3, "0")}`,
        timestamp: new Date(start + index * 1000).toISOString(),
        agentId: agentRun.id,
        agentName: agentRun.name,
        phase: step.phase,
        message: step.detail,
        toolName: step.toolName,
        evidenceIds: step.sources.map((sourceRef) => sourceRef.id),
        confidence: step.confidence,
        durationMs: 900 + (index % 5) * 100,
        status: agentRun.status === "warning" ? "warning" : "success"
      };
    })
  );
}

function agent(
  id: string,
  name: string,
  purpose: string,
  durationMs: number,
  tokens: number,
  costUsd: number,
  confidence: number,
  steps: AgentRun["steps"],
  status: AgentRun["status"] = "complete"
): AgentRun {
  return {
    id,
    name,
    purpose,
    status,
    durationMs,
    tokens,
    costUsd,
    confidence,
    steps
  };
}

function step(
  phase: AgentRun["steps"][number]["phase"],
  detail: string,
  confidence: number,
  toolName: string,
  sources: AgentRun["steps"][number]["sources"]
): AgentRun["steps"][number] {
  return { phase, detail, confidence, toolName, sources };
}
