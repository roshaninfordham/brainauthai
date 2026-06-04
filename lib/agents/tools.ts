import { evidence } from "../data/demoCase";
import { payerCriteria } from "../data/payerPolicy";
import type { ClinicalFact, CriteriaMatch, DocumentationGap } from "../schemas/clinical";

export function extractClinicalFacts(includeMedicationHistory: boolean): ClinicalFact[] {
  const facts: ClinicalFact[] = [
    fact("fact-patient", "patient", "Patient", "John Doe, 64M", "John Doe, 64M", 0.96, [evidence.age]),
    fact("fact-age", "age", "Age", "64", 64, 0.96, [evidence.age]),
    fact("fact-nihss", "nihss", "NIHSS", "18", 18, 0.96, [evidence.nihss]),
    fact("fact-lkw", "last-known-well", "Last Known Well", "08:12 AM", "08:12 AM", 0.94, [evidence.lkw]),
    fact("fact-symptoms", "symptoms", "Symptoms", "Right-sided weakness, aphasia, facial droop", undefined, 0.93, [
      evidence.symptoms
    ]),
    fact("fact-glucose", "glucose", "Glucose", "116 mg/dL", 116, 0.93, [evidence.glucose]),
    fact("fact-bp", "blood-pressure", "Blood Pressure", "168/92", "168/92", 0.92, [evidence.bloodPressure]),
    fact("fact-mrs", "baseline-mrs", "Baseline mRS", "1", 1, 0.91, [evidence.mrs]),
    fact("fact-lvo", "lvo", "CTA finding", "Left M1 MCA LVO", true, 0.97, [evidence.lvo]),
    fact("fact-hemorrhage", "hemorrhage", "Hemorrhage", "Excluded on CT", true, 0.97, [evidence.hemorrhage]),
    fact("fact-aspects", "aspects", "ASPECTS", "8", 8, 0.92, [evidence.aspects])
  ];

  if (includeMedicationHistory) {
    facts.push(
      fact(
        "fact-medication",
        "medication-history",
        "Medication history",
        "No active anticoagulant documented",
        "No active anticoagulant documented",
        0.94,
        [evidence.medicationPresent]
      )
    );
  }

  return facts;
}

export function matchPolicyCriteria(includeMedicationHistory: boolean): CriteriaMatch[] {
  const sources = evidence;
  const policy = evidence.payerPolicy;
  return [
    criteria(
      "match-adult",
      payerCriteria[0].criterion,
      "met",
      "Patient age is documented as 64.",
      0.96,
      [policy, sources.age],
      false
    ),
    criteria(
      "match-deficit",
      payerCriteria[1].criterion,
      "met",
      "Aphasia, right facial droop, dense right arm weakness, and NIHSS 18 are documented.",
      0.95,
      [policy, sources.symptoms, sources.nihss],
      false
    ),
    criteria(
      "match-lvo",
      payerCriteria[2].criterion,
      "met",
      "CTA report documents left M1 middle cerebral artery occlusion.",
      0.97,
      [policy, sources.lvo],
      false
    ),
    criteria(
      "match-hemorrhage",
      payerCriteria[3].criterion,
      "met",
      "Non-contrast CT documents no acute intracranial hemorrhage.",
      0.97,
      [policy, sources.hemorrhage],
      false
    ),
    criteria(
      "match-time",
      payerCriteria[4].criterion,
      "met",
      "Last-known-well is documented as 08:12 AM.",
      0.94,
      [policy, sources.lkw],
      false
    ),
    criteria(
      "match-imaging-review",
      payerCriteria[5].criterion,
      "met",
      "CTA documents LVO and CT documents ASPECTS 8.",
      0.94,
      [policy, sources.lvo, sources.aspects],
      false
    ),
    criteria(
      "match-medication",
      payerCriteria[6].criterion,
      includeMedicationHistory ? "met" : "missing",
      includeMedicationHistory
        ? "Medication reconciliation addendum documents no active anticoagulant use."
        : "Anticoagulant history is not documented in the current packet.",
      includeMedicationHistory ? 0.94 : 0.82,
      includeMedicationHistory ? [policy, sources.medicationPresent] : [policy],
      !includeMedicationHistory
    ),
    criteria(
      "match-transfer",
      payerCriteria[7].criterion,
      "review",
      "Transfer request is documented; final receiving-center callback time still requires human review.",
      0.88,
      [policy, sources.transfer, sources.receivingCallbackMissing],
      true
    )
  ];
}

export function detectDocumentationGaps(includeMedicationHistory: boolean): DocumentationGap[] {
  const gaps: DocumentationGap[] = [];
  if (!includeMedicationHistory) {
    gaps.push({
      id: "gap-medication-history",
      item: "Medication and anticoagulant history",
      severity: "critical",
      action: "Attach medication reconciliation or clinician attestation before payer-submission draft review.",
      owner: "ED clinician",
      source: evidence.payerPolicy
    });
  }
  gaps.push({
    id: "gap-callback-time",
    item: "Receiving center callback time",
    severity: "low",
    action: "Add timestamp when transfer center confirms final bed assignment.",
    owner: "Transfer coordinator",
    source: evidence.receivingCallbackMissing
  });
  return gaps;
}

function fact(
  id: string,
  key: string,
  label: string,
  value: string,
  normalizedValue: string | number | boolean | undefined,
  confidence: number,
  sources: ClinicalFact["sources"]
): ClinicalFact {
  return {
    id,
    key,
    label,
    value,
    normalizedValue,
    confidence,
    status: "extracted",
    sources,
    source: sources.map((sourceRef) => sourceRef.documentTitle).join(", ")
  };
}

function criteria(
  id: string,
  criterion: string,
  status: CriteriaMatch["status"],
  evidenceText: string,
  confidence: number,
  sources: CriteriaMatch["sources"],
  humanReviewRequired: boolean
): CriteriaMatch {
  return {
    id,
    criterion,
    status,
    evidence: evidenceText,
    confidence,
    sources,
    humanReviewRequired,
    unsupportedClaims: 0
  };
}
