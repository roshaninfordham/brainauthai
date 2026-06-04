import { SourceDocumentSchema, type SourceDocument, type SourceEvidence } from "../schemas/clinical";

export const demoDocuments: SourceDocument[] = [
  {
    id: "ehr-note-001",
    title: "Emergency Department Stroke Note",
    type: "ehr",
    pageCount: 1,
    content:
      "Patient: John Doe, 64-year-old male. Last known well 08:12 AM. Sudden right facial droop, aphasia, left gaze preference, dense right arm weakness. NIHSS documented as 18 on arrival. Glucose 116 mg/dL. Blood pressure 168/92. Baseline modified Rankin score 1. Transfer requested for endovascular evaluation."
  },
  {
    id: "cta-report-001",
    title: "CT Head and CTA Head/Neck Report",
    type: "imaging",
    pageCount: 1,
    content:
      "CT head without contrast: no acute intracranial hemorrhage. ASPECTS 8. CTA head and neck: left M1 middle cerebral artery occlusion with reduced distal MCA opacification. Impression: acute left MCA large-vessel occlusion, thrombectomy-capable center review recommended."
  },
  {
    id: "transfer-note-001",
    title: "Rural ED Transfer Note",
    type: "transfer",
    pageCount: 1,
    content:
      "Rural ED requests transfer to comprehensive stroke center. Reason: suspected acute ischemic stroke with CTA-confirmed left M1 occlusion. Patient accepted by neurointerventional service pending packet completion. Final receiving-center callback time not yet documented."
  },
  {
    id: "payer-policy-001",
    title: "Synthetic Payer Thrombectomy Documentation Policy",
    type: "payer-policy",
    pageCount: 2,
    content:
      "Coverage documentation criteria for emergent endovascular thrombectomy review: adult patient; disabling acute ischemic stroke deficit; NIHSS generally >=6; last known well or advanced imaging rationale documented; vessel imaging confirming anterior circulation large-vessel occlusion; hemorrhage excluded by CT or MRI; baseline functional status documented; contraindications and anticoagulant history reviewed; transfer note and treating physician attestation included."
  },
  {
    id: "med-rec-001",
    title: "Medication Reconciliation Attestation",
    type: "medication",
    pageCount: 1,
    content:
      "Medication reconciliation addendum: no active anticoagulant use documented by treating ED clinician. No medication-history contraindication documented for transfer documentation packet."
  }
];

export const validatedDemoDocuments = demoDocuments.map((doc) => SourceDocumentSchema.parse(doc));

export const evidence = {
  age: source("evidence-age", "ehr-note-001", "Patient: John Doe, 64-year-old male.", 0.96),
  lkw: source("evidence-lkw", "ehr-note-001", "Last known well 08:12 AM.", 0.94),
  symptoms: source(
    "evidence-symptoms",
    "ehr-note-001",
    "Sudden right facial droop, aphasia, left gaze preference, dense right arm weakness.",
    0.93
  ),
  nihss: source("evidence-nihss", "ehr-note-001", "NIHSS documented as 18 on arrival.", 0.96),
  glucose: source("evidence-glucose", "ehr-note-001", "Glucose 116 mg/dL.", 0.93),
  bloodPressure: source("evidence-bp", "ehr-note-001", "Blood pressure 168/92.", 0.92),
  mrs: source("evidence-mrs", "ehr-note-001", "Baseline modified Rankin score 1.", 0.91),
  hemorrhage: source(
    "evidence-hemorrhage",
    "cta-report-001",
    "CT head without contrast: no acute intracranial hemorrhage.",
    0.97
  ),
  aspects: source("evidence-aspects", "cta-report-001", "ASPECTS 8.", 0.92),
  lvo: source(
    "evidence-lvo",
    "cta-report-001",
    "CTA head and neck: left M1 middle cerebral artery occlusion with reduced distal MCA opacification.",
    0.97
  ),
  imagingReview: source(
    "evidence-imaging-review",
    "cta-report-001",
    "Impression: acute left MCA large-vessel occlusion, thrombectomy-capable center review recommended.",
    0.94
  ),
  transfer: source(
    "evidence-transfer",
    "transfer-note-001",
    "Rural ED requests transfer to comprehensive stroke center.",
    0.9
  ),
  receivingCallbackMissing: source(
    "evidence-callback-missing",
    "transfer-note-001",
    "Final receiving-center callback time not yet documented.",
    0.9
  ),
  payerPolicy: source(
    "evidence-payer-policy",
    "payer-policy-001",
    "Coverage documentation criteria for emergent endovascular thrombectomy review: adult patient; disabling acute ischemic stroke deficit; NIHSS generally >=6; last known well or advanced imaging rationale documented; vessel imaging confirming anterior circulation large-vessel occlusion; hemorrhage excluded by CT or MRI; baseline functional status documented; contraindications and anticoagulant history reviewed; transfer note and treating physician attestation included.",
    0.91
  ),
  medicationPresent: source(
    "evidence-medication-present",
    "med-rec-001",
    "Medication reconciliation addendum: no active anticoagulant use documented by treating ED clinician.",
    0.94
  )
} satisfies Record<string, SourceEvidence>;

export function source(
  id: string,
  documentId: string,
  sourceQuote: string,
  confidence: number
): SourceEvidence {
  const doc = validatedDemoDocuments.find((candidate) => candidate.id === documentId);
  if (!doc) throw new Error(`Unknown source document ${documentId}`);
  return {
    id,
    documentId,
    documentTitle: doc.title,
    sourceType: doc.type,
    sourcePage: 1,
    sourceQuote,
    confidence
  };
}
