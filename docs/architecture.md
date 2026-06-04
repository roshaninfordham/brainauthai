# BrainAuth AI Architecture

## System Overview

BrainAuth AI is a Next.js full-stack MVP with deterministic TypeScript agents, Zod-validated contracts, source-grounded synthetic records, optional Azure AI Document Intelligence parsing, and PDF packet export.

```mermaid
flowchart TB
  Landing[/Landing Page/] --> Demo[/Live MVP Demo/]
  Demo --> Analyze[/POST /api/analyze/]
  Demo --> AzureStatus[/GET /api/azure-document/]
  Analyze --> Runner[Deterministic Agent Runner]
  Runner --> Tools[Agent Tool Layer]
  Tools --> Data[Source-Grounded Synthetic Records]
  Data --> Schemas[Zod Schemas]
  Runner --> Packet[Packet Draft + FHIR-style JSON]
  Packet --> Pdf[/POST /api/packet/]
  Azure[/POST /api/azure-document/] -. optional .-> Runner
```

## Frontend Stack

- Next.js App Router
- React
- TypeScript
- Recharts for the time-is-brain graph
- Framer Motion for restrained landing animation
- lucide-react icons
- CSS design tokens for a light clinical SaaS theme

## Runtime Contracts

Zod schemas validate:

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

## Production Path

```mermaid
flowchart LR
  PDF[Hospital PDFs] --> AzureDI[Azure AI Document Intelligence]
  AzureDI --> Extracted[Text, tables, fields, confidence]
  Extracted --> Validation[Zod validation]
  Validation --> Agents[Agent runner or LLM tool calls]
  Agents --> Packet[Clinician-review packet draft]
  Packet --> Signoff[Physician review and signoff]
```

The hackathon demo uses deterministic local extraction so the live presentation is reliable.
