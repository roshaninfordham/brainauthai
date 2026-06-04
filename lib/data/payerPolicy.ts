import { PolicyCriterionSchema, type PolicyCriterion } from "../schemas/clinical";
import { evidence } from "./demoCase";

export const payerCriteria: PolicyCriterion[] = [
  {
    id: "criterion-adult",
    criterion: "Adult patient documented",
    description: "Policy requires adult patient documentation.",
    requiredEvidenceKeys: ["age"],
    source: evidence.payerPolicy
  },
  {
    id: "criterion-disabling-deficit",
    criterion: "Disabling neurologic deficit documented",
    description: "Policy requires disabling acute ischemic stroke deficit documentation.",
    requiredEvidenceKeys: ["symptoms", "nihss"],
    source: evidence.payerPolicy
  },
  {
    id: "criterion-lvo",
    criterion: "Large-vessel occlusion documented",
    description: "Policy requires vessel imaging confirming anterior circulation LVO.",
    requiredEvidenceKeys: ["lvo"],
    source: evidence.payerPolicy
  },
  {
    id: "criterion-hemorrhage",
    criterion: "Hemorrhage excluded",
    description: "Policy requires CT or MRI exclusion of hemorrhage.",
    requiredEvidenceKeys: ["hemorrhage"],
    source: evidence.payerPolicy
  },
  {
    id: "criterion-time-window",
    criterion: "Last-known-well documented",
    description: "Policy requires last-known-well or advanced imaging rationale documentation.",
    requiredEvidenceKeys: ["lkw"],
    source: evidence.payerPolicy
  },
  {
    id: "criterion-imaging-supports-review",
    criterion: "Imaging supports intervention review",
    description: "Policy requires imaging documentation supporting specialist review.",
    requiredEvidenceKeys: ["aspects", "imagingReview"],
    source: evidence.payerPolicy
  },
  {
    id: "criterion-contraindications",
    criterion: "Contraindications and anticoagulant history reviewed",
    description: "Policy requires contraindication and anticoagulant-history documentation.",
    requiredEvidenceKeys: ["medicationPresent"],
    source: evidence.payerPolicy
  },
  {
    id: "criterion-transfer-review",
    criterion: "Receiving stroke center review documented",
    description: "Policy requires transfer note and treating physician attestation.",
    requiredEvidenceKeys: ["transfer"],
    source: evidence.payerPolicy
  }
].map((criterion) => PolicyCriterionSchema.parse(criterion));
