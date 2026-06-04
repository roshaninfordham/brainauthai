import { z } from "zod";
import {
  ClinicalFactSchema,
  CriteriaMatchSchema,
  DocumentationGapSchema,
  PatientSchema,
  SourceEvidenceSchema
} from "./clinical";
import { AgentEventSchema, AgentRunSchema, AuditEntrySchema, ObservabilityMetricsSchema } from "./audit";

export const MetricCardSchema = z.object({
  label: z.string(),
  value: z.string(),
  note: z.string(),
  sourceLabel: z.string(),
  sourceUrl: z.string().url()
});

export const SourceLinkSchema = z.object({
  label: z.string(),
  url: z.string().url()
});

export const FhirPacketSchema = z.object({
  resourceType: z.literal("Bundle"),
  type: z.literal("document"),
  id: z.string(),
  timestamp: z.string(),
  entry: z.array(
    z.object({
      resource: z
        .object({
          resourceType: z.string(),
          id: z.string()
        })
        .passthrough()
    })
  )
});

export const MedicalNecessityDraftSchema = z.object({
  text: z.string(),
  sourceRefs: z.array(SourceEvidenceSchema),
  requiresClinicianSignature: z.boolean()
});

export const PacketSummarySchema = z.object({
  manualMinutes: z.number().nonnegative(),
  brainAuthMinutes: z.number().nonnegative(),
  minutesSaved: z.number().nonnegative(),
  neuronsAtRiskAvoided: z.number().int().nonnegative(),
  readinessScore: z.number().int().min(0).max(100),
  disposition: z.string(),
  medicalNecessityLetter: z.string(),
  medicalNecessityDraft: MedicalNecessityDraftSchema,
  fhirPacket: FhirPacketSchema,
  blockers: z.array(z.string()),
  unsupportedClaims: z.number().int().nonnegative()
});

export const AnalysisResultSchema = z.object({
  runId: z.string(),
  generatedAt: z.string(),
  mode: z.enum(["local-demo", "azure-document-intelligence"]),
  patient: PatientSchema,
  facts: z.array(ClinicalFactSchema),
  criteria: z.array(CriteriaMatchSchema),
  gaps: z.array(DocumentationGapSchema),
  agents: z.array(AgentRunSchema),
  events: z.array(AgentEventSchema),
  audit: z.array(AuditEntrySchema),
  metrics: ObservabilityMetricsSchema,
  packet: PacketSummarySchema,
  sources: z.array(SourceLinkSchema)
});

export type MetricCard = z.infer<typeof MetricCardSchema>;
export type SourceLink = z.infer<typeof SourceLinkSchema>;
export type FhirPacket = z.infer<typeof FhirPacketSchema>;
export type MedicalNecessityDraft = z.infer<typeof MedicalNecessityDraftSchema>;
export type PacketSummary = z.infer<typeof PacketSummarySchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
