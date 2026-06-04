# B.E. FAST Monitoring Extension

## Product Intent

The B.E. FAST monitor is a BrainAuth AI extension for pre-monitoring and post-monitoring patients who may show sudden stroke warning symptoms.

It does not diagnose stroke. It watches for B.E. FAST warning signals, fuses them with EHR context, and prepares emergency-first actions:

- Call emergency services now.
- Notify the care circle.
- Request urgent stroke clinician callback.
- Save an audit trail.

## B.E. FAST Signals

```mermaid
mindmap
  root((B.E. FAST))
    B[Balance loss]
    E[Eye or vision changes]
    F[Face drooping]
    A[Arm weakness]
    S[Speech difficulty]
    T[Time to call emergency services]
```

## Demo Flow

```mermaid
sequenceDiagram
  participant User
  participant UI as BrainAuth Monitor UI
  participant Route as /api/vision-monitor
  participant Agents as Monitoring Agents
  participant Actions as Care Circle Actions

  User->>UI: Upload video or choose demo clip
  User->>UI: Click Run B.E. FAST Monitor
  UI->>Route: Submit video metadata
  Route-->>UI: Azure/local mode, B.E. FAST findings, event plan
  UI->>Agents: Stream visible events with 1-2s delay
  Agents-->>UI: Alert score and findings
  UI->>Actions: Auto-click emergency prompt
  UI->>Actions: Queue loved one notification
  UI->>Actions: Request urgent clinician callback
  UI-->>User: Emergency-first warning and audit-ready trace
```

## Agent Design

```mermaid
flowchart TB
  subgraph Video[Video Signal Path]
    Upload[Uploaded or synthetic video]
    Frames[Frame sampler]
    Vision[Azure AI Vision-ready analysis]
    Findings[B.E. FAST visual findings]
  end

  subgraph Context[EHR Context Path]
    EHR[Longitudinal EHR facts]
    Risk[Risk context summary]
  end

  subgraph Agents[Agentic Response]
    Classifier[B.E. FAST Classifier]
    Fusion[EHR Fusion]
    Escalation[Escalation Agent]
    Audit[Monitoring Audit]
  end

  Upload --> Frames --> Vision --> Findings --> Classifier
  EHR --> Risk --> Fusion
  Classifier --> Fusion --> Escalation --> Audit
  Escalation --> EMS[Emergency prompt]
  Escalation --> Family[Loved one notification]
  Escalation --> Doctor[Urgent stroke clinician callback]
```

## Azure AI Vision Path

The MVP route `/api/vision-monitor` checks for:

```bash
AZURE_AI_VISION_ENDPOINT
AZURE_AI_VISION_KEY
```

or legacy-compatible names:

```bash
AZURE_COMPUTER_VISION_ENDPOINT
AZURE_COMPUTER_VISION_KEY
```

If credentials exist, the UI reports **Azure AI Vision configured**. If not, it reports **Local vision demo mode** and uses deterministic findings for reliability.

Production implementation:

```mermaid
flowchart LR
  Video[Live or uploaded video] --> Sampler[Frame sampler]
  Sampler --> Selected[Representative frames]
  Selected --> Azure[Azure AI Vision]
  Azure --> Objects[Visual findings + confidence]
  Objects --> BEFAST[B.E. FAST signal scoring]
  BEFAST --> Care[Care-circle escalation]
  Care --> Audit[Audit log]
```

## Safety Rules

```mermaid
flowchart TD
  Signal[Possible stroke warning signal] --> Threshold{B.E. FAST threshold crossed?}
  Threshold -->|No| Monitor[Continue monitoring and ask for human review]
  Threshold -->|Yes| Emergency[Show emergency-first prompt]
  Emergency --> Family[Notify loved one]
  Emergency --> Callback[Request urgent clinician callback]
  Emergency --> Audit[Save action audit]
  Monitor --> Audit
```

Rules:

- Do not claim diagnosis.
- Do not tell the user to wait for a normal appointment if sudden symptoms are present.
- Use emergency-first copy: call emergency services now.
- Treat Azure output as one signal, not the final decision.
- Record confidence, missing signals, and human review requirements.

## User Experience

The section is intentionally placed below the packet workflow because it is an expansion product:

1. Current wedge: acute stroke packet readiness.
2. Expansion: home/post-discharge B.E. FAST monitoring.
3. Platform: acute neurovascular coordination OS.

The UI uses:

- A visible upload button.
- A demo clip option for reliable judging.
- Live video-style overlays.
- B.E. FAST tiles.
- Agent events with staged delays.
- Big alert score.
- Auto-clicked care actions.
- Safety caveat.
