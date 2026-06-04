export { impactMetrics, sourceLinks } from "./data/stats";

export const syntheticDocuments = {
  ehrNote: `Emergency department note. Patient: John Doe, 64-year-old male.
Last known well 08:12. Arrival 09:01. Sudden right facial droop, aphasia,
left gaze preference, dense right arm weakness. NIHSS 18. Glucose 116.
Blood pressure 174/92. No known intracranial hemorrhage history. Baseline
modified Rankin score 1. Transfer requested for endovascular evaluation.`,
  ctaReport: `CT head without contrast: no acute intracranial hemorrhage.
ASPECTS 8. CTA head and neck: left M1 middle cerebral artery occlusion with
reduced distal MCA opacification. Impression: acute left MCA large-vessel
occlusion, thrombectomy-capable center recommended.`,
  payerPolicy: `Coverage criteria for emergent endovascular thrombectomy:
document disabling acute ischemic stroke, NIHSS generally >=6, last known
well within accepted treatment window or advanced imaging rationale, vessel
imaging confirming anterior circulation LVO, hemorrhage excluded by CT/MRI,
baseline functional status documented, contraindications and anticoagulant
history reviewed, transfer note and treating physician attestation included.`,
  transferNote: `Rural ED requests transfer to comprehensive stroke center.
Reason: suspected acute ischemic stroke with CTA-confirmed left M1 occlusion.
Patient accepted by neurointerventional service pending packet completion.`
};
