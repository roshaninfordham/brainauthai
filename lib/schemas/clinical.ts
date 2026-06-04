import { z } from "zod";

export const ConfidenceSchema = z.number().min(0).max(1);

export const EvidenceStatusSchema = z.enum(["met", "missing", "review", "conflict"]);

export const SourceDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["ehr", "imaging", "transfer", "payer-policy", "medication", "external-source"]),
  pageCount: z.number().int().positive(),
  content: z.string()
});

export const SourceEvidenceSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  documentTitle: z.string(),
  sourceType: z.enum(["ehr", "imaging", "transfer", "payer-policy", "medication", "external-source"]),
  sourcePage: z.number().int().positive(),
  sourceQuote: z.string().min(1),
  confidence: ConfidenceSchema,
  url: z.string().url().optional()
});

export const ClinicalFactSchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  value: z.string(),
  normalizedValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  confidence: ConfidenceSchema,
  status: z.enum(["extracted", "missing", "needs_review", "conflict"]),
  sources: z.array(SourceEvidenceSchema).min(1),
  source: z.string().optional()
});

export const PolicyCriterionSchema = z.object({
  id: z.string(),
  criterion: z.string(),
  description: z.string(),
  requiredEvidenceKeys: z.array(z.string()),
  source: SourceEvidenceSchema
});

export const CriteriaMatchSchema = z.object({
  id: z.string(),
  criterion: z.string(),
  status: EvidenceStatusSchema,
  evidence: z.string(),
  confidence: ConfidenceSchema,
  sources: z.array(SourceEvidenceSchema),
  humanReviewRequired: z.boolean(),
  unsupportedClaims: z.number().int().nonnegative().default(0)
});

export const DocumentationGapSchema = z.object({
  id: z.string(),
  item: z.string(),
  severity: z.enum(["critical", "moderate", "low"]),
  action: z.string(),
  owner: z.string(),
  source: SourceEvidenceSchema.optional()
});

export const PatientSchema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
  sex: z.string(),
  facility: z.string(),
  payer: z.string(),
  status: z.string()
});

export type Confidence = z.infer<typeof ConfidenceSchema>;
export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>;
export type SourceDocument = z.infer<typeof SourceDocumentSchema>;
export type SourceEvidence = z.infer<typeof SourceEvidenceSchema>;
export type ClinicalFact = z.infer<typeof ClinicalFactSchema>;
export type PolicyCriterion = z.infer<typeof PolicyCriterionSchema>;
export type CriteriaMatch = z.infer<typeof CriteriaMatchSchema>;
export type DocumentationGap = z.infer<typeof DocumentationGapSchema>;
export type Patient = z.infer<typeof PatientSchema>;
