# BrainAuth AI Architecture

## System Map

```mermaid
flowchart TB
  User[Stroke Team User] --> UI[BrainAuth AI Mission Control]
  UI --> Analyze[/POST /api/analyze/]
  UI --> Packet[/POST /api/packet/]

  Analyze --> Extract[Document Extraction Layer]
  Extract --> Azure{Azure DI configured?}
  Azure -->|Yes| AIDoc[Azure AI Document Intelligence]
  Azure -->|No| Demo[Deterministic Synthetic Parser]

  AIDoc --> Facts[Structured Clinical Facts]
  Demo --> Facts

  Facts --> Triage[Triage Extractor Agent]
  Facts --> Imaging[Imaging Evidence Agent]
  Facts --> Policy[Payer Policy Agent]

  Triage --> Necessity[Medical Necessity Agent]
  Imaging --> Necessity
  Policy --> Necessity
  Necessity --> Gaps[Gap Detector Agent]
  Gaps --> Builder[Packet Builder Agent]
  Builder --> Audit[Audit Agent]
  Audit --> Outputs[Packet, FHIR JSON, Letter, Audit Log]
  Outputs --> Review[Human Clinician Review]
```

## Packet Lifecycle

```mermaid
sequenceDiagram
  participant Clinician
  participant UI as Mission Control UI
  participant API as Analyze API
  participant Agents as Agent Engine
  participant PDF as PDF Packet API

  Clinician->>UI: Run Stroke Packet
  UI->>API: POST /api/analyze
  API->>Agents: Build analysis
  Agents-->>API: Facts, criteria, gaps, audit
  API-->>UI: AnalysisResult
  UI-->>Clinician: Stream agent timeline
  Clinician->>UI: Attach medication history
  UI->>API: POST /api/analyze with gap resolved
  API->>Agents: Regenerate packet
  Agents-->>API: Higher readiness result
  API-->>UI: Updated AnalysisResult
  Clinician->>UI: Download PDF Packet
  UI->>PDF: POST /api/packet
  PDF-->>Clinician: PDF download
```

## Agent Contracts

```mermaid
classDiagram
  class AgentRun {
    string id
    string name
    string purpose
    AgentStatus status
    number durationMs
    number tokens
    number costUsd
    number confidence
    AgentStep[] steps
  }

  class AgentStep {
    AgentPhase phase
    string detail
    number confidence
  }

  class AnalysisResult {
    string runId
    string generatedAt
    string mode
    PatientFact[] facts
    CriteriaMatch[] criteria
    DocumentationGap[] gaps
    AgentRun[] agents
    AuditEvent[] audit
    PacketSummary packet
  }

  AnalysisResult "1" --> "*" AgentRun
  AgentRun "1" --> "*" AgentStep
```

## Why One Azure Service

Azure AI Document Intelligence is the most directly relevant Azure service for this product because it extracts structured text, tables, selection marks, and key-value data from PDFs/forms. That maps to payer policy PDFs, EHR packets, CTA reports, insurance cards, and transfer forms.
