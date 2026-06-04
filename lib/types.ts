export type AgentPhase = "Research" | "Plan" | "Act" | "Verify" | "Report";

export type AgentStatus = "queued" | "active" | "complete" | "warning";

export type EvidenceStatus = "met" | "missing" | "review";

export interface MetricCard {
  label: string;
  value: string;
  note: string;
}

export interface SourceLink {
  label: string;
  url: string;
}

export interface PatientFact {
  label: string;
  value: string;
  confidence: number;
  source: string;
}

export interface CriteriaMatch {
  criterion: string;
  status: EvidenceStatus;
  evidence: string;
  confidence: number;
}

export interface DocumentationGap {
  item: string;
  severity: "critical" | "moderate" | "low";
  action: string;
  owner: string;
}

export interface AgentStep {
  phase: AgentPhase;
  detail: string;
  confidence: number;
}

export interface AgentRun {
  id: string;
  name: string;
  purpose: string;
  status: AgentStatus;
  durationMs: number;
  tokens: number;
  costUsd: number;
  confidence: number;
  steps: AgentStep[];
}

export interface AuditEvent {
  at: string;
  agent: string;
  action: string;
  result: string;
  confidence: number;
}

export interface FhirPacket {
  resourceType: "Bundle";
  type: "document";
  id: string;
  timestamp: string;
  entry: Array<{
    resource: {
      resourceType: string;
      id: string;
      [key: string]: unknown;
    };
  }>;
}

export interface PacketSummary {
  manualMinutes: number;
  brainAuthMinutes: number;
  minutesSaved: number;
  neuronsAtRiskAvoided: number;
  readinessScore: number;
  disposition: string;
  medicalNecessityLetter: string;
  fhirPacket: FhirPacket;
}

export interface AnalysisResult {
  runId: string;
  generatedAt: string;
  mode: "local-demo" | "azure-document-intelligence";
  patient: {
    name: string;
    age: number;
    sex: string;
    facility: string;
    payer: string;
    status: string;
  };
  facts: PatientFact[];
  criteria: CriteriaMatch[];
  gaps: DocumentationGap[];
  agents: AgentRun[];
  audit: AuditEvent[];
  packet: PacketSummary;
  sources: SourceLink[];
}
