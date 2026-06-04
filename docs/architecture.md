# BrainAuth AI Architecture

## System Overview

BrainAuth AI is a Next.js full-stack MVP with two visible product lanes:

- **Stroke packet readiness:** source-grounded documentation, payer criteria mapping, medical necessity drafting, FHIR-style JSON, PDF/TXT exports, and audit trail.
- **B.E. FAST monitoring:** uploaded or synthetic symptom video, Azure AI Vision-ready frame analysis, EHR context fusion, care-circle alerting, urgent clinician callback request, and safety audit.

The hackathon implementation is deterministic for presentation reliability. Azure adapters are truthfully enabled only when credentials exist; otherwise the UI labels local demo mode.

```mermaid
flowchart TB
  Landing[/Landing Page/] --> Demo[/Live MVP Demo/]

  subgraph UI[Next.js Clinical SaaS UI]
    PacketUI[Stroke Packet Mission Control]
    MonitorUI[B.E. FAST Monitor]
    Downloads[PDF, TXT, FHIR Downloads]
    Drawers[Collapsed Audit, Agent Trace, Source Detail]
  end

  Demo --> PacketUI
  Demo --> MonitorUI
  PacketUI --> Downloads
  PacketUI --> Drawers
  MonitorUI --> Drawers

  subgraph API[Next.js API Routes]
    Analyze[/POST /api/analyze/]
    PacketPdf[/GET /api/export/demo-packet/pdf/]
    PacketText[/GET /api/export/demo-packet/text/]
    IngestPdf[/GET /api/ingest-demo-pdf/]
    Vision[/POST /api/vision-monitor/]
  end

  PacketUI --> Analyze
  PacketUI --> IngestPdf
  Downloads --> PacketPdf
  Downloads --> PacketText
  MonitorUI --> Vision

  subgraph Agents[Deterministic Agent Layer]
    StrokeAgents[Stroke Documentation Agents]
    MonitorAgents[B.E. FAST Monitoring Agents]
    Audit[Safety and Grounding Audit]
  end

  Analyze --> StrokeAgents
  Vision --> MonitorAgents
  StrokeAgents --> Audit
  MonitorAgents --> Audit
```

## Azure-Ready Integration Points

```mermaid
flowchart LR
  subgraph Documents[Document Inputs]
    EHR[EHR PDF]
    CTA[CT/CTA PDF]
    Policy[Payer Policy PDF]
    Transfer[Transfer Note]
  end

  subgraph Video[Monitoring Inputs]
    Upload[Uploaded Symptom Video]
    Stream[Future Live Video Stream]
    Longitudinal[Longitudinal EHR Context]
  end

  EHR --> DI[Azure AI Document Intelligence]
  CTA --> DI
  Policy --> DI
  Transfer --> DI
  DI --> Extracted[Text, Tables, Fields, Confidence]

  Upload --> Frames[Frame Sampler]
  Stream --> Frames
  Frames --> Vision[Azure AI Vision]
  Vision --> Findings[Visual Findings + Confidence]
  Longitudinal --> Fusion[EHR + Vision Fusion]
  Findings --> Fusion

  Extracted --> StrokeAgents[Stroke Packet Agents]
  Fusion --> MonitorAgents[B.E. FAST Monitor Agents]
```

## Stroke Packet Sequence

```mermaid
sequenceDiagram
  participant Clinician
  participant UI as BrainAuth UI
  participant PDF as PDF Ingestion Route
  participant Agents as Stroke Agents
  participant Export as Export Routes

  Clinician->>UI: Run Stroke Packet
  UI->>PDF: Ingest synthetic EHR PDF
  PDF-->>UI: Extracted fields + parser mode
  UI->>Agents: Analyze case
  Agents-->>UI: Facts, criteria, gaps, audit, packet
  UI-->>Clinician: Verdict + readiness score
  Clinician->>Export: Download PDF/TXT/FHIR
  Export-->>Clinician: Clinician-review artifacts
```

## B.E. FAST Monitoring Sequence

```mermaid
sequenceDiagram
  participant Caregiver
  participant UI as B.E. FAST Monitor
  participant Vision as Vision Monitor Route
  participant Agents as Monitoring Agents
  participant Actions as Care Circle Actions

  Caregiver->>UI: Upload video or use demo clip
  Caregiver->>UI: Run B.E. FAST Monitor
  UI->>Vision: Submit video metadata
  Vision-->>UI: Azure/local mode + deterministic findings
  UI->>Agents: Stream video, B.E. FAST, EHR fusion events
  Agents-->>UI: Emergency escalation verdict
  UI->>Actions: Auto-click emergency prompt
  UI->>Actions: Queue loved one notification
  UI->>Actions: Request urgent stroke clinician callback
  UI-->>Caregiver: Not diagnostic; call emergency services now
```

## Agent Safety Boundaries

```mermaid
flowchart TD
  Claim[Clinical or monitoring claim] --> Evidence{Source evidence?}
  Evidence -->|Yes| Confidence{Confidence >= threshold?}
  Evidence -->|No| Gap[Mark missing or needs review]
  Confidence -->|Yes| Show[Display with source and confidence]
  Confidence -->|No| Review[Human review required]
  Show --> Human[Physician or emergency responder review]
  Gap --> Human
  Review --> Human
```

## Runtime Contracts

Zod schemas validate stroke packet data:

- Source documents
- Source evidence
- Clinical facts
- Policy criteria
- Criteria matches
- Documentation gaps
- Agent steps and events
- Audit entries
- Observability metrics
- Packet output

The monitoring extension currently uses deterministic typed responses from `/api/vision-monitor`. A production version should add Zod schemas for video-frame findings, B.E. FAST signals, alert actions, and care-circle audit records.

## Production Path

```mermaid
flowchart TB
  Hospital[EHR and Stroke Workflow Systems] --> SecureStore[Secure Document and Event Store]
  Home[Home or Post-Discharge Monitoring] --> StreamGateway[Consent-Based Video Gateway]
  SecureStore --> AzureDI[Azure AI Document Intelligence]
  StreamGateway --> AzureVision[Azure AI Vision]
  AzureDI --> AgentRuntime[Agent Runtime with Tool Calls]
  AzureVision --> AgentRuntime
  AgentRuntime --> ReviewQueue[Clinician Review Queue]
  ReviewQueue --> Packet[Transfer/Payer Packet]
  ReviewQueue --> Escalation[Emergency and Care-Circle Escalation]
  Packet --> AuditLog[Immutable Audit Log]
  Escalation --> AuditLog
```

## Demo Reliability

The live MVP deliberately uses synthetic data and deterministic local outputs. This avoids hallucinated clinical behavior and prevents demo failure if Azure credentials or network access are unavailable. Azure connectivity is shown only when credentials are configured.
