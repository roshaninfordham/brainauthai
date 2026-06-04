import { z } from "zod";
import { ConfidenceSchema, SourceEvidenceSchema } from "./clinical";

export const AgentPhaseSchema = z.enum([
  "Queued",
  "Extracted",
  "Mapped",
  "Checked",
  "Flagged",
  "Prepared",
  "Verified",
  "Complete"
]);

export const AgentStatusSchema = z.enum(["queued", "active", "complete", "warning", "failed"]);

export const AgentStepSchema = z.object({
  phase: AgentPhaseSchema,
  detail: z.string(),
  confidence: ConfidenceSchema,
  toolName: z.string().optional(),
  sources: z.array(SourceEvidenceSchema).default([])
});

export const AgentRunSchema = z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.string(),
  status: AgentStatusSchema,
  durationMs: z.number().int().nonnegative(),
  tokens: z.number().int().nonnegative(),
  costUsd: z.number().nonnegative(),
  confidence: ConfidenceSchema,
  steps: z.array(AgentStepSchema)
});

export const AgentEventSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  agentId: z.string(),
  agentName: z.string(),
  phase: AgentPhaseSchema,
  message: z.string(),
  toolName: z.string().optional(),
  evidenceIds: z.array(z.string()).default([]),
  confidence: ConfidenceSchema.optional(),
  durationMs: z.number().int().nonnegative(),
  status: z.enum(["queued", "active", "success", "warning", "error"])
});

export const AuditEntrySchema = z.object({
  at: z.string().datetime(),
  agent: z.string(),
  action: z.string(),
  result: z.string(),
  confidence: ConfidenceSchema,
  sources: z.array(SourceEvidenceSchema).default([])
});

export const ObservabilityMetricsSchema = z.object({
  totalDurationMs: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  totalCostUsd: z.number().nonnegative(),
  averageConfidence: ConfidenceSchema,
  evidenceCoveragePct: z.number().min(0).max(100),
  unsupportedClaims: z.number().int().nonnegative(),
  humanReviewItems: z.number().int().nonnegative(),
  documentsParsed: z.number().int().nonnegative(),
  criteriaMatched: z.number().int().nonnegative(),
  gapsFound: z.number().int().nonnegative()
});

export type AgentPhase = z.infer<typeof AgentPhaseSchema>;
export type AgentStatus = z.infer<typeof AgentStatusSchema>;
export type AgentStep = z.infer<typeof AgentStepSchema>;
export type AgentRun = z.infer<typeof AgentRunSchema>;
export type AgentEvent = z.infer<typeof AgentEventSchema>;
export type AuditEntry = z.infer<typeof AuditEntrySchema>;
export type ObservabilityMetrics = z.infer<typeof ObservabilityMetricsSchema>;
