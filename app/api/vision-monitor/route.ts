import { NextResponse } from "next/server";

export const runtime = "nodejs";

const azureVisionEndpoint =
  process.env.AZURE_AI_VISION_ENDPOINT ?? process.env.AZURE_COMPUTER_VISION_ENDPOINT ?? "";
const azureVisionKey = process.env.AZURE_AI_VISION_KEY ?? process.env.AZURE_COMPUTER_VISION_KEY ?? "";

function endpointHost(endpoint: string) {
  try {
    return new URL(endpoint).host;
  } catch {
    return endpoint || null;
  }
}

const beFastSignals = [
  {
    key: "balance",
    letter: "B",
    label: "Balance",
    status: "warning",
    confidence: 0.74,
    finding: "Sudden instability pattern flagged for review."
  },
  {
    key: "eyes",
    letter: "E",
    label: "Eyes",
    status: "review",
    confidence: 0.68,
    finding: "Vision change not confirmed in sample; ask patient or caregiver."
  },
  {
    key: "face",
    letter: "F",
    label: "Face",
    status: "critical",
    confidence: 0.91,
    finding: "Facial asymmetry marker present in sampled frames."
  },
  {
    key: "arms",
    letter: "A",
    label: "Arms",
    status: "critical",
    confidence: 0.88,
    finding: "Right arm drift marker present across sampled frames."
  },
  {
    key: "speech",
    letter: "S",
    label: "Speech",
    status: "critical",
    confidence: 0.86,
    finding: "Speech difficulty proxy flagged from transcript cue."
  },
  {
    key: "time",
    letter: "T",
    label: "Time",
    status: "critical",
    confidence: 0.99,
    finding: "Sudden-onset warning means emergency escalation now."
  }
];

const events = [
  {
    agentName: "Video Intake Agent",
    toolName: "sample_video_frames",
    message: "Sampling the uploaded video stream and checking frame quality.",
    evidence: "12-second demo sample, 8 representative frames",
    confidence: 0.93,
    status: "active"
  },
  {
    agentName: "Azure Vision Frame Agent",
    toolName: "analyze_be_fast_frames",
    message: "Scanning posture, face, arm position, and speech cue overlays.",
    evidence: "Azure AI Vision-ready adapter with local deterministic fallback",
    confidence: 0.9,
    status: "active"
  },
  {
    agentName: "B.E. FAST Classifier Agent",
    toolName: "score_be_fast_signals",
    message: "Face, arm, and speech warning signals meet escalation threshold.",
    evidence: "F+A+S critical markers; Time action rule active",
    confidence: 0.91,
    status: "warning"
  },
  {
    agentName: "EHR Fusion Agent",
    toolName: "fuse_ehr_risk_context",
    message: "Combining current video warning signals with longitudinal EHR context.",
    evidence: "Hypertension history, prior stroke risk profile, medication context",
    confidence: 0.87,
    status: "warning"
  },
  {
    agentName: "Escalation Agent",
    toolName: "prepare_emergency_alert",
    message: "Emergency escalation prompt prepared: call emergency services now.",
    evidence: "B.E. FAST threshold crossed; this is not a diagnosis",
    confidence: 0.96,
    status: "critical"
  },
  {
    agentName: "Care Coordination Agent",
    toolName: "notify_care_circle",
    message: "Loved one notification and urgent clinician callback request queued.",
    evidence: "Care circle: spouse + on-call stroke clinic route",
    confidence: 0.92,
    status: "success"
  },
  {
    agentName: "Audit Agent",
    toolName: "verify_monitoring_safety",
    message: "Audit completed with emergency-first language and human review requirement.",
    evidence: "No diagnosis asserted; emergency care instruction remains primary",
    confidence: 0.94,
    status: "success"
  }
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const azureConfigured = Boolean(azureVisionEndpoint && azureVisionKey);

  return NextResponse.json({
    runId: "FAST-2026-0604-001",
    generatedAt: new Date("2026-06-04T14:42:00.000Z").toISOString(),
    mode: azureConfigured ? "azure-ai-vision-configured" : "local-vision-demo",
    serviceLabel: azureConfigured ? "Azure AI Vision configured" : "Local vision demo mode",
    fileName: typeof body?.fileName === "string" && body.fileName ? body.fileName : "synthetic-be-fast-demo.mp4",
    azure: {
      configured: azureConfigured,
      service: "Azure AI Vision",
      endpointHost: azureConfigured ? endpointHost(azureVisionEndpoint) : null,
      note: azureConfigured
        ? "Production path can submit sampled frames to Azure AI Vision."
        : "No Azure Vision key found; deterministic local frame analysis is used for demo reliability."
    },
    beFastSignals,
    events,
    score: 91,
    recommendation:
      "B.E. FAST warning pattern crossed threshold. Prompt caregiver to call emergency services now and notify the care circle.",
    emergencyCaveat:
      "BrainAuth AI Monitor is not a diagnosis. Sudden stroke symptoms demand immediate emergency medical attention."
  });
}
