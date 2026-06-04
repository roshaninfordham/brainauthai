"use client";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardList,
  Download,
  Database,
  FileCheck2,
  FileJson,
  FileText,
  HeartPulse,
  Layers3,
  Play,
  RadioTower,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TimerReset,
  UploadCloud,
  Workflow,
  Zap
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AuditTrail } from "../../components/product/AuditTrail";
import { CriteriaMatrix } from "../../components/product/CriteriaMatrix";
import { EvidenceMap } from "../../components/product/EvidenceMap";
import { FhirJsonPanel } from "../../components/product/FhirJsonPanel";
import { FastMonitor } from "../../components/product/FastMonitor";
import { HumanReviewBanner } from "../../components/product/HumanReviewBanner";
import { ObservabilityPanel } from "../../components/product/ObservabilityPanel";
import { PacketPreview } from "../../components/product/PacketPreview";
import type { AnalysisResult, DocumentationGap } from "../../lib/types";

type RunStatus = "idle" | "running" | "complete" | "error";
type OutputView = "evidence" | "criteria" | "packet";
type IngestionStatus = "idle" | "running" | "complete" | "error";

interface ParsedPdfFact {
  label: string;
  value: string;
  confidence: number;
  sourceQuote: string;
}

interface PdfIngestionResult {
  mode: string;
  parser: string;
  fileName: string;
  sourcePath: string;
  pageCount: number;
  processingMs: number;
  textPreview: string;
  facts: ParsedPdfFact[];
  unsupportedClaims: number;
  humanReviewItems: number;
}

interface TimelineEvent {
  agentId: string;
  agentName: string;
  phase: string;
  detail: string;
  confidence: number;
}

const documentStack = [
  { name: "ED stroke note", meta: "NIHSS, LKW, vitals" },
  { name: "CT / CTA report", meta: "LVO, ASPECTS, hemorrhage" },
  { name: "Payer policy PDF", meta: "Coverage checklist" },
  { name: "Transfer note", meta: "Receiving center handoff" }
];

function compactNumber(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  return value.toLocaleString();
}

function confidenceLabel(value: number) {
  return `${Math.round(value * 100)}%`;
}

function severityClass(severity: DocumentationGap["severity"]) {
  if (severity === "critical") return "severityCritical";
  if (severity === "moderate") return "severityModerate";
  return "severityLow";
}

function percentLabel(value: number) {
  return `${Math.round(value)}%`;
}

function CollapsiblePanel({
  title,
  description,
  icon,
  defaultOpen = false,
  children
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="collapsiblePanel" open={defaultOpen}>
      <summary>
        <span className="collapsibleTitle">
          {icon}
          <span>
            <strong>{title}</strong>
            {description && <small>{description}</small>}
          </span>
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <div className="collapsibleContent">{children}</div>
    </details>
  );
}

function ProgressBar({
  label,
  value,
  caption,
  tone = "primary"
}: {
  label: string;
  value: number;
  caption: string;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  return (
    <div className="progressMetric">
      <div>
        <span>{label}</span>
        <strong>{percentLabel(value)}</strong>
      </div>
      <div className={`barTrack ${tone}`} aria-hidden="true">
        <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <small>{caption}</small>
    </div>
  );
}

export default function Home() {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [includeMedicationHistory, setIncludeMedicationHistory] = useState(false);
  const [outputView, setOutputView] = useState<OutputView>("packet");
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<IngestionStatus>("idle");
  const [ingestionResult, setIngestionResult] = useState<PdfIngestionResult | null>(null);

  const events = useMemo<TimelineEvent[]>(() => {
    if (!analysis) return [];
    return analysis.agents.flatMap((agent) =>
      agent.steps.map((step) => ({
        agentId: agent.id,
        agentName: agent.name,
        phase: step.phase,
        detail: step.detail,
        confidence: step.confidence
      }))
    );
  }, [analysis]);

  const visibleEvents = events.slice(0, visibleCount);
  const activeEvent = status === "running" ? events[Math.min(visibleCount, events.length - 1)] : null;
  const readyAnalysis = status === "complete" ? analysis : null;
  const packetReady = Boolean(readyAnalysis);
  const criticalGaps = analysis?.gaps.filter((gap) => gap.severity === "critical").length ?? 0;
  const reviewItems = readyAnalysis ? readyAnalysis.metrics.humanReviewItems : 0;
  const evidenceCoverage = readyAnalysis ? readyAnalysis.metrics.evidenceCoveragePct : 0;
  const unsupportedClaims = readyAnalysis ? readyAnalysis.metrics.unsupportedClaims : 0;
  const criteriaMet = readyAnalysis ? readyAnalysis.criteria.filter((criterion) => criterion.status === "met").length : 0;
  const criteriaTotal = readyAnalysis ? readyAnalysis.criteria.length : 8;
  const criteriaPercent = packetReady ? (criteriaMet / Math.max(criteriaTotal, 1)) * 100 : 0;
  const readinessScore = readyAnalysis ? readyAnalysis.packet.readinessScore : 0;
  const averageConfidence = readyAnalysis ? readyAnalysis.metrics.averageConfidence * 100 : 0;
  const agentProgress = events.length > 0 ? (visibleEvents.length / events.length) * 100 : 0;
  const verdictTone = !packetReady ? "idle" : criticalGaps > 0 ? "warning" : "success";
  const verdictLabel = packetReady
    ? criticalGaps > 0
      ? "Needs clinician review"
      : "Ready for clinician review"
    : status === "running"
      ? "Running packet agents"
      : "Awaiting packet run";
  const verdictDescription = packetReady
    ? criticalGaps > 0
      ? "The packet is drafted, but critical documentation gaps are clearly blocked before submission."
      : "Every packet claim is source-grounded and ready for physician review before submission."
    : status === "running"
      ? "BrainAuth is ingesting the PDF, extracting evidence, checking payer criteria, and preparing the packet."
      : "Run the demo to parse the PDF, extract evidence, and build the packet draft.";

  useEffect(() => {
    if (status !== "running" || !analysis) return;
    if (visibleCount >= events.length) {
      const done = window.setTimeout(() => setStatus("complete"), 350);
      return () => window.clearTimeout(done);
    }

    const timer = window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + 1, events.length));
    }, 420);

    return () => window.clearTimeout(timer);
  }, [analysis, events.length, status, visibleCount]);

  async function runAnalysis(nextMedicationState = includeMedicationHistory) {
    setStatus("running");
    setError("");
    setVisibleCount(0);
    setOutputView("packet");
    setAnalysis(null);

    try {
      await ingestDemoPdf();
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeMedicationHistory: nextMedicationState })
      });

      if (!response.ok) throw new Error("Analysis failed");
      const result = (await response.json()) as AnalysisResult;
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStatus("error");
    }
  }

  async function ingestDemoPdf() {
    setIngestionStatus("running");
    setIngestionResult(null);
    const startedAt = Date.now();

    try {
      const response = await fetch("/api/ingest-demo-pdf");
      if (!response.ok) throw new Error("Demo PDF ingestion failed");
      const result = (await response.json()) as PdfIngestionResult;
      const elapsed = Date.now() - startedAt;
      if (elapsed < 1200) {
        await new Promise((resolve) => window.setTimeout(resolve, 1200 - elapsed));
      }
      setIngestionResult(result);
      setIngestionStatus("complete");
      return result;
    } catch (err) {
      setIngestionStatus("error");
      throw err;
    }
  }

  function attachMedicationHistory() {
    setIncludeMedicationHistory(true);
    void runAnalysis(true);
  }

  function resetDemo() {
    setStatus("idle");
    setAnalysis(null);
    setVisibleCount(0);
    setIncludeMedicationHistory(false);
    setOutputView("packet");
    setError("");
    setIngestionStatus("idle");
    setIngestionResult(null);
  }

  function downloadJson() {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis.packet.fhirPacket, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${analysis.runId}-fhir-packet.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadLetter() {
    if (!analysis) return;
    const blob = new Blob([analysis.packet.medicalNecessityLetter], {
      type: "text/plain"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${analysis.runId}-medical-necessity-letter.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function downloadReviewText() {
    if (!analysis) return;
    const response = await fetch(
      `/api/export/demo-packet/text?includeMedicationHistory=${includeMedicationHistory ? "true" : "false"}`
    );
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${analysis.runId}-brainauth-verdict.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPdfPacket() {
    if (!analysis) return;
    setIsDownloading(true);
    try {
      const response = await fetch(
        `/api/export/demo-packet/pdf?includeMedicationHistory=${includeMedicationHistory ? "true" : "false"}`
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${analysis.runId}-brainauth-packet.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="appShell">
      <header className="topBar">
        <div className="brandBlock">
          <div className="brandMark">
            <Brain size={23} aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">Prior Auth Before Brain Dies</p>
            <h1>BrainAuth AI</h1>
          </div>
        </div>
        <div className="topActions">
          <Link className="navButton" href="/">
            <ArrowLeft size={15} aria-hidden="true" />
            Landing
          </Link>
          <span className="azureBadge">
            <RadioTower size={15} aria-hidden="true" />
            {analysis?.mode === "azure-document-intelligence"
              ? "Azure Document Intelligence Connected"
              : "Local parser demo mode"}
          </span>
          <span className="caveatBadge">
            <ShieldCheck size={15} aria-hidden="true" />
            Emergency stabilization stays first
          </span>
        </div>
      </header>

      <section className="demoSnapshotBand" aria-label="Demo outcome metrics">
        <article className="snapshotCard primary">
          <span>Packet readiness</span>
          <strong>{packetReady ? `${readinessScore}%` : status === "running" ? "..." : "Run"}</strong>
          <small>{verdictLabel}</small>
        </article>
        <article className="snapshotCard">
          <span>Manual to BrainAuth</span>
          <strong>{readyAnalysis ? readyAnalysis.packet.manualMinutes : 30} to {readyAnalysis ? readyAnalysis.packet.brainAuthMinutes : 2} min</strong>
          <small>{readyAnalysis ? readyAnalysis.packet.minutesSaved : 28} minutes attacked</small>
        </article>
        <article className="snapshotCard success">
          <span>Neurons at risk avoided</span>
          <strong>{compactNumber(readyAnalysis ? readyAnalysis.packet.neuronsAtRiskAvoided : 53200000)}</strong>
          <small>Estimate, not guaranteed neurons saved</small>
        </article>
        <article className="snapshotCard">
          <span>Evidence safety</span>
          <strong>{unsupportedClaims}</strong>
          <small>unsupported claims</small>
        </article>
      </section>

      <section className="commandGrid">
        <aside className="leftPanel panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Patient</p>
              <h2>{analysis?.patient.name ?? "John Doe"}</h2>
            </div>
            <span className="statusPill critical">
              <HeartPulse size={14} aria-hidden="true" />
              Critical
            </span>
          </div>

          <div className="patientStats">
            <div>
              <span>Age</span>
              <strong>{analysis?.patient.age ?? 64}</strong>
            </div>
            <div>
              <span>NIHSS</span>
              <strong>{analysis?.facts.find((fact) => fact.label === "NIHSS")?.value ?? "18"}</strong>
            </div>
            <div>
              <span>Last Known Well</span>
              <strong>{analysis?.facts.find((fact) => fact.label === "Last Known Well")?.value ?? "08:12 AM"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>LVO</strong>
            </div>
          </div>

          <div className="scanFrame">
            <img src="/neuro-scan.svg" alt="CTA evidence visualization showing left M1 MCA LVO" />
          </div>

          <div className={`pdfIngestStatus ${ingestionStatus}`}>
            {ingestionStatus === "running" ? (
              <CircleDot size={15} aria-hidden="true" />
            ) : ingestionStatus === "complete" ? (
              <CheckCircle2 size={15} aria-hidden="true" />
            ) : ingestionStatus === "error" ? (
              <AlertTriangle size={15} aria-hidden="true" />
            ) : (
              <UploadCloud size={15} aria-hidden="true" />
            )}
            <div>
              <strong>
                {ingestionStatus === "running"
                  ? "Parsing PDF"
                  : ingestionStatus === "complete"
                    ? "PDF ingested"
                    : ingestionStatus === "error"
                      ? "PDF ingestion failed"
                      : "PDF ready"}
              </strong>
              <span>
                {ingestionResult
                  ? `${ingestionResult.parser} · ${ingestionResult.facts.length} fields · ${ingestionResult.pageCount} page · ${ingestionResult.unsupportedClaims} unsupported claims`
                  : "Synthetic EHR record staged for Azure Document Intelligence or local parser fallback."}
              </span>
            </div>
          </div>

          <CollapsiblePanel
            title="Source PDF"
            description="Open only when judges ask to see the ingested record."
            icon={<FileText size={16} aria-hidden="true" />}
          >
            <div className="pdfDemoPanel">
              <iframe
                title="BrainAuth synthetic stroke record PDF"
                src="/demo/brainauth-stroke-demo-record.pdf#toolbar=0&navpanes=0"
              />
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel
            title="Uploaded records"
            description="EHR, CTA, payer policy, and transfer note."
            icon={<Layers3 size={16} aria-hidden="true" />}
          >
            <div className="documentStack">
              {documentStack.map((doc, index) => {
                const isParsed = status !== "idle" && Boolean(analysis);
                return (
                  <div className="documentRow" key={doc.name}>
                    <FileText size={16} aria-hidden="true" />
                    <div>
                      <strong>{doc.name}</strong>
                      <span>{doc.meta}</span>
                    </div>
                    <small className={isParsed ? "parsed" : ""}>
                      {isParsed ? "parsed" : index === 2 ? "ready" : "queued"}
                    </small>
                  </div>
                );
              })}
            </div>
          </CollapsiblePanel>
        </aside>

        <section className="centerPanel panel">
          <div className="missionHeader">
            <div>
              <p className="eyebrow">AI Mission Control</p>
              <h2>Clinician-review stroke packet draft in one agentic run</h2>
            </div>
            <div className="missionControls">
              <button
                className="iconButton"
                type="button"
                title="Reset demo"
                aria-label="Reset demo"
                onClick={resetDemo}
              >
                <TimerReset size={18} aria-hidden="true" />
              </button>
              <button
                className="primaryButton"
                type="button"
                onClick={() => void runAnalysis()}
                disabled={status === "running"}
              >
                {status === "running" ? (
                  <CircleDot size={17} aria-hidden="true" />
                ) : (
                  <Play size={17} aria-hidden="true" />
                )}
                {status === "running" ? "Agents Running" : "Run Stroke Packet"}
              </button>
            </div>
          </div>

          <div className={`verdictDashboard ${verdictTone}`}>
            <div className="readinessBlock">
              <div className="readinessDial" style={{ "--score": readinessScore } as CSSProperties}>
                <strong>{packetReady ? readinessScore : "--"}</strong>
                <span>readiness</span>
              </div>
              <div>
                <p className="eyebrow">Packet Verdict</p>
                <h2>{verdictLabel}</h2>
                <p>{verdictDescription}</p>
              </div>
            </div>

            <div className="verdictKpis">
              <div>
                <span>Time saved</span>
                <strong>{readyAnalysis ? readyAnalysis.packet.minutesSaved : 28} min</strong>
                <small>{readyAnalysis ? readyAnalysis.packet.manualMinutes : 30} min manual to {readyAnalysis ? readyAnalysis.packet.brainAuthMinutes : 2} min BrainAuth</small>
              </div>
              <div>
                <span>Neurons at risk avoided</span>
                <strong>{compactNumber(readyAnalysis ? readyAnalysis.packet.neuronsAtRiskAvoided : 53200000)}</strong>
                <small>Estimate: minutes saved x 1.9M</small>
              </div>
              <div>
                <span>Unsupported claims</span>
                <strong>{unsupportedClaims}</strong>
                <small>Claims without evidence are blocked</small>
              </div>
              <div>
                <span>Human review items</span>
                <strong>{reviewItems}</strong>
                <small>Missing data stays visible</small>
              </div>
            </div>

            <div className="verdictProgressGrid">
              <ProgressBar
                label="Evidence coverage"
                value={evidenceCoverage}
                caption={packetReady ? "Packet facts mapped to source quotes." : "Runs after document ingestion."}
                tone="success"
              />
              <ProgressBar
                label="Criteria matched"
                value={criteriaPercent}
                caption={packetReady ? `${criteriaMet} of ${criteriaTotal} criteria matched or reviewed.` : "Payer matrix pending."}
                tone={criticalGaps > 0 ? "warning" : "primary"}
              />
              <ProgressBar
                label="Average confidence"
                value={averageConfidence}
                caption={packetReady ? "Source-grounded extraction confidence." : "Agent confidence pending."}
                tone="primary"
              />
            </div>
          </div>

          {readyAnalysis && (
            <div className="artifactStrip" aria-label="Download packet artifacts">
              <div>
                <p className="eyebrow">Packet Artifacts</p>
                <h3>Download the verdict files judges expect to see.</h3>
              </div>
              <button type="button" onClick={downloadPdfPacket} disabled={isDownloading}>
                <Download size={16} aria-hidden="true" />
                {isDownloading ? "Building PDF" : "PDF Packet"}
              </button>
              <button type="button" onClick={() => void downloadReviewText()}>
                <FileCheck2 size={16} aria-hidden="true" />
                Verdict TXT
              </button>
              <button type="button" onClick={downloadLetter}>
                <FileText size={16} aria-hidden="true" />
                Letter TXT
              </button>
              <button type="button" onClick={downloadJson}>
                <FileJson size={16} aria-hidden="true" />
                FHIR JSON
              </button>
            </div>
          )}

          <div className="chatSurface" aria-live="polite">
            <div className="chatMessage system">
              <Sparkles size={18} aria-hidden="true" />
              <p>
                BrainAuth AI prepares source-grounded documentation evidence around acute
                stroke care. It does not delay emergency screening or stabilization.
              </p>
            </div>

            <div className="uploadStrip">
              <div>
                <UploadCloud size={19} aria-hidden="true" />
                <span>Synthetic EHR, CTA report, transfer note, and payer policy loaded</span>
              </div>
              <small>{analysis?.mode === "azure-document-intelligence" ? "Azure parse path" : "Local demo parse path"}</small>
            </div>

            {status === "running" && (
              <div className="runStateBanner active">
                <CircleDot size={17} aria-hidden="true" />
                <div>
                  <strong>
                    {ingestionStatus === "running" ? "Document ingestion" : activeEvent?.phase ?? "Queued"}
                  </strong>
                  <span>
                    {ingestionStatus === "running"
                      ? "Parsing the embedded synthetic EHR PDF with pdf-parse before agent extraction."
                      : activeEvent?.detail ?? "Preparing source-grounded agent run..."}
                  </span>
                </div>
              </div>
            )}

            {ingestionResult && (
              <CollapsiblePanel
                title="Parsed PDF fields"
                description={`${ingestionResult.parser} extracted ${ingestionResult.facts.length} fields from ${ingestionResult.pageCount} page.`}
                icon={<SearchCheck size={16} aria-hidden="true" />}
              >
                <div className="pdfParsedFacts">
                <div className="pdfParsedGrid">
                  {ingestionResult.facts.slice(0, 6).map((fact) => (
                    <div key={fact.label}>
                      <span>{fact.label}</span>
                      <strong>{fact.value}</strong>
                      <small>{Math.round(fact.confidence * 100)}% confidence</small>
                    </div>
                  ))}
                </div>
              </div>
              </CollapsiblePanel>
            )}

            {status === "complete" && analysis && criticalGaps === 0 && (
              <div className="runStateBanner success">
                <CheckCircle2 size={17} aria-hidden="true" />
                <div>
                  <strong>Packet draft ready for physician review.</strong>
                  <span>Unsupported claims: {analysis.metrics.unsupportedClaims}. Evidence coverage: {analysis.metrics.evidenceCoveragePct}%.</span>
                </div>
              </div>
            )}

            {status === "complete" && analysis && criticalGaps > 0 && (
              <div className="runStateBanner warning">
                <AlertTriangle size={17} aria-hidden="true" />
                <div>
                  <strong>{criticalGaps} critical item requires human review.</strong>
                  <span>Missing fields are blocked as gaps instead of being invented.</span>
                </div>
              </div>
            )}

            {status === "idle" && (
              <div className="emptyRun">
                <Workflow size={28} aria-hidden="true" />
                <h3>Seven clinical agents standing by</h3>
                <p>Extract facts, map criteria, check evidence, flag gaps, and prepare a review draft.</p>
              </div>
            )}

            {status === "error" && (
              <div className="errorBox">
                <AlertTriangle size={18} aria-hidden="true" />
                <span>{error}</span>
                <button type="button" onClick={() => void runAnalysis()}>
                  Retry
                </button>
              </div>
            )}

            {(status === "running" || visibleEvents.length > 0) && (
              <div className="agentProgressCard">
                <div>
                  <span>Agent run progress</span>
                  <strong>
                    {visibleEvents.length}/{events.length || 21} actions
                  </strong>
                </div>
                <div className={`barTrack ${ingestionStatus === "running" ? "indeterminate" : "primary"}`} aria-hidden="true">
                  <span style={{ width: `${Math.max(4, Math.min(100, agentProgress))}%` }} />
                </div>
                <small>
                  {ingestionStatus === "running"
                    ? "Document parsing is visible before agent execution."
                    : activeEvent?.detail ?? "Agent action trace complete."}
                </small>
              </div>
            )}

            {visibleEvents.length > 0 && (
              <CollapsiblePanel
                title="Agent action trace"
                description={`${visibleEvents.length} of ${events.length} source-grounded actions streamed.`}
                icon={<Activity size={16} aria-hidden="true" />}
              >
                <div className="eventStream">
                  {visibleEvents.map((event, index) => (
                    <div className="eventLine" key={`${event.agentId}-${event.phase}-${index}`}>
                      <div className="eventDot" />
                      <div>
                        <span>
                          {event.agentName} · {event.phase}
                        </span>
                        <strong>{event.detail}</strong>
                      </div>
                      <small>{confidenceLabel(event.confidence)}</small>
                    </div>
                  ))}
                </div>
              </CollapsiblePanel>
            )}
          </div>

          {readyAnalysis && (
            <div className="outputPanel">
              <div className="tabBar" role="tablist" aria-label="Generated packet views">
                {[
                  ["packet", "Packet Preview", FileCheck2],
                  ["criteria", "Criteria Matrix", ClipboardList],
                  ["evidence", "Evidence", Database]
                ].map(([id, label, Icon]) => (
                  <button
                    key={id as string}
                    className={outputView === id ? "activeTab" : ""}
                    type="button"
                    role="tab"
                    aria-selected={outputView === id}
                    onClick={() => setOutputView(id as OutputView)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {label as string}
                  </button>
                ))}
              </div>

              {outputView === "evidence" && <EvidenceMap analysis={readyAnalysis} />}

              {outputView === "criteria" && <CriteriaMatrix analysis={readyAnalysis} />}

              {outputView === "packet" && (
                <div className="packetView">
                  <HumanReviewBanner />
                  <PacketPreview analysis={readyAnalysis} />
                </div>
              )}

              <div className="technicalDrawers">
                <CollapsiblePanel
                  title="Audit trail"
                  description={`${readyAnalysis.events.length} events · ${readyAnalysis.metrics.unsupportedClaims} unsupported claims.`}
                  icon={<ShieldCheck size={16} aria-hidden="true" />}
                >
                  <AuditTrail analysis={readyAnalysis} />
                </CollapsiblePanel>

                <CollapsiblePanel
                  title="FHIR-style JSON"
                  description="Exportable structured packet for integration demos."
                  icon={<FileJson size={16} aria-hidden="true" />}
                >
                  <FhirJsonPanel analysis={readyAnalysis} />
                </CollapsiblePanel>
              </div>
            </div>
          )}
        </section>

        <aside className="rightPanel panel">
          <CollapsiblePanel
            title="Agent activity and safety checks"
            description={
              status === "running"
                ? activeEvent?.detail ?? "Agents are running."
                : status === "complete"
                  ? `${analysis?.agents.length ?? 0} agents complete · ${unsupportedClaims} unsupported claims.`
                  : "Expandable technical proof for judges."
            }
            icon={<Activity size={16} aria-hidden="true" />}
            defaultOpen={status === "running"}
          >
            <div className="technicalGrid">
              <div className="agentRail">
                {(analysis?.agents ?? []).map((agent) => {
                  const completedSteps = visibleEvents.filter((event) => event.agentId === agent.id).length;
                  const visualStatus =
                    completedSteps === 0
                      ? "queued"
                      : completedSteps < agent.steps.length
                        ? "active"
                        : agent.status;

                  return (
                    <div className={`agentCard ${visualStatus}`} key={agent.id}>
                      <div className="agentIcon">
                        {visualStatus === "complete" ? (
                          <CheckCircle2 size={17} aria-hidden="true" />
                        ) : visualStatus === "warning" ? (
                          <AlertTriangle size={17} aria-hidden="true" />
                        ) : visualStatus === "active" ? (
                          <CircleDot size={17} aria-hidden="true" />
                        ) : (
                          <Workflow size={17} aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <strong>{agent.name}</strong>
                        <span>{agent.purpose}</span>
                        <div className="phaseChips">
                          {agent.steps.map((step, index) => (
                            <small className={index < completedSteps ? "phaseDone" : ""} key={`${agent.id}-${step.phase}-${index}`}>
                              {step.phase}
                            </small>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!analysis && (
                  <div className="agentPlaceholder">
                    <Stethoscope size={20} aria-hidden="true" />
                    <span>Run the packet to stream source-grounded audit events.</span>
                  </div>
                )}
              </div>

              <div>
                <div className="gapBox">
                  <div className="sectionTitle">
                    <AlertTriangle size={16} aria-hidden="true" />
                    Documentation Gaps
                  </div>
                  {analysis ? (
                    analysis.gaps.map((gap) => (
                      <div className="gapRow" key={gap.item}>
                        <span className={severityClass(gap.severity)}>{gap.severity}</span>
                        <strong>{gap.item}</strong>
                        <p>{gap.action}</p>
                        <small>{gap.owner}</small>
                      </div>
                    ))
                  ) : (
                    <p className="mutedCopy">No packet has been analyzed yet.</p>
                  )}
                  {analysis && criticalGaps > 0 && (
                    <button className="resolveButton" type="button" onClick={attachMedicationHistory} disabled={status === "running"}>
                      <Zap size={16} aria-hidden="true" />
                      Attach Medication History
                    </button>
                  )}
                </div>

                <ObservabilityPanel analysis={analysis} />
              </div>
            </div>
          </CollapsiblePanel>
        </aside>
      </section>

      <FastMonitor />
    </main>
  );
}
