"use client";

import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Clock,
  Download,
  FileCheck2,
  FileJson,
  FileText,
  Gauge,
  HeartPulse,
  Layers3,
  Play,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TimerReset,
  UploadCloud,
  Workflow,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { impactMetrics } from "../lib/sample-case";
import type { AgentRun, AnalysisResult, CriteriaMatch, DocumentationGap } from "../lib/types";

type RunStatus = "idle" | "running" | "complete" | "error";
type OutputView = "packet" | "criteria" | "fhir" | "audit";

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

function criteriaClass(status: CriteriaMatch["status"]) {
  if (status === "met") return "criteriaMet";
  if (status === "missing") return "criteriaMissing";
  return "criteriaReview";
}

function agentRuntime(agents: AgentRun[]) {
  const runtime = agents.reduce((sum, agent) => sum + agent.durationMs, 0) / 1000;
  const tokens = agents.reduce((sum, agent) => sum + agent.tokens, 0);
  const cost = agents.reduce((sum, agent) => sum + agent.costUsd, 0);
  const confidence =
    agents.reduce((sum, agent) => sum + agent.confidence, 0) / Math.max(agents.length, 1);

  return { runtime, tokens, cost, confidence };
}

export default function Home() {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [includeMedicationHistory, setIncludeMedicationHistory] = useState(false);
  const [outputView, setOutputView] = useState<OutputView>("packet");
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

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
  const runtime = analysis ? agentRuntime(analysis.agents) : null;
  const criticalGaps = analysis?.gaps.filter((gap) => gap.severity === "critical").length ?? 0;

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

  async function downloadPdfPacket() {
    if (!analysis) return;
    setIsDownloading(true);
    try {
      const response = await fetch("/api/packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis })
      });
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
          <span className="azureBadge">
            <RadioTower size={15} aria-hidden="true" />
            Azure AI Document Intelligence
          </span>
          <span className="caveatBadge">
            <ShieldCheck size={15} aria-hidden="true" />
            Emergency stabilization stays first
          </span>
        </div>
      </header>

      <section className="metricsBand" aria-label="Stroke impact metrics">
        {impactMetrics.map((metric) => (
          <article className="metricCard" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
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

          <div className="documentStack">
            <div className="sectionTitle">
              <Layers3 size={16} aria-hidden="true" />
              Uploaded Records
            </div>
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
        </aside>

        <section className="centerPanel panel">
          <div className="missionHeader">
            <div>
              <p className="eyebrow">AI Mission Control</p>
              <h2>Clinician-review stroke packet in one run</h2>
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

          <div className="timeSavedHero">
            <div>
              <span>Manual packet baseline</span>
              <strong>{analysis?.packet.manualMinutes ?? 30} min</strong>
            </div>
            <ChevronRight size={22} aria-hidden="true" />
            <div>
              <span>BrainAuth packet time</span>
              <strong>{analysis?.packet.brainAuthMinutes ?? 2} min</strong>
            </div>
            <div className="neuronsCounter">
              <span>Neurons at risk avoided</span>
              <strong>{compactNumber(analysis?.packet.neuronsAtRiskAvoided ?? 53200000)}</strong>
            </div>
          </div>

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

            {status === "idle" && (
              <div className="emptyRun">
                <Workflow size={28} aria-hidden="true" />
                <h3>Six clinical agents standing by</h3>
                <p>Extract facts, map criteria, check evidence, flag gaps, and prepare a review draft.</p>
              </div>
            )}

            {status === "error" && (
              <div className="errorBox">
                <AlertTriangle size={18} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {visibleEvents.length > 0 && (
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
            )}
          </div>

          {analysis && (
            <div className="outputPanel">
              <div className="tabBar" role="tablist" aria-label="Generated packet views">
                {[
                  ["packet", "Packet", FileCheck2],
                  ["criteria", "Criteria", ClipboardList],
                  ["fhir", "FHIR JSON", FileJson],
                  ["audit", "Audit", ShieldCheck]
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

              {outputView === "packet" && (
                <div className="packetView">
                  <div className="readinessBlock">
                    <div className="readinessDial" style={{ "--score": analysis.packet.readinessScore } as React.CSSProperties}>
                      <strong>{analysis.packet.readinessScore}%</strong>
                      <span>Review</span>
                    </div>
                    <div>
                      <h3>{analysis.packet.disposition}</h3>
                      <p>{analysis.packet.medicalNecessityLetter.split("\n\n")[2]}</p>
                    </div>
                  </div>

                  <div className="actionRow">
                    <button type="button" onClick={downloadPdfPacket} disabled={isDownloading}>
                      <Download size={16} aria-hidden="true" />
                      {isDownloading ? "Building PDF" : "Download PDF Packet"}
                    </button>
                    <button type="button" onClick={downloadLetter}>
                      <FileText size={16} aria-hidden="true" />
                      Medical Necessity Letter
                    </button>
                    <button type="button" onClick={downloadJson}>
                      <FileJson size={16} aria-hidden="true" />
                      FHIR JSON
                    </button>
                  </div>
                </div>
              )}

              {outputView === "criteria" && (
                <div className="criteriaList">
                  {analysis.criteria.map((item) => (
                    <div className="criteriaRow" key={item.criterion}>
                      <span className={criteriaClass(item.status)}>{item.status}</span>
                      <div>
                        <strong>{item.criterion}</strong>
                        <p>{item.evidence}</p>
                      </div>
                      <small>{confidenceLabel(item.confidence)}</small>
                    </div>
                  ))}
                </div>
              )}

              {outputView === "fhir" && (
                <pre className="jsonBlock">{JSON.stringify(analysis.packet.fhirPacket, null, 2)}</pre>
              )}

              {outputView === "audit" && (
                <div className="auditList">
                  {analysis.audit.map((event) => (
                    <div className="auditRow" key={`${event.at}-${event.agent}`}>
                      <Clock size={15} aria-hidden="true" />
                      <div>
                        <strong>{event.agent}</strong>
                        <span>
                          {event.action}: {event.result}
                        </span>
                      </div>
                      <small>{confidenceLabel(event.confidence)}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="rightPanel panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Agent Activity</p>
              <h2>{status === "running" ? activeEvent?.agentName ?? "Launching agents" : "Run Timeline"}</h2>
            </div>
            <span className={status === "complete" ? "statusPill done" : "statusPill"}>
              <Activity size={14} aria-hidden="true" />
              {status === "complete" ? "Complete" : status === "running" ? "Live" : "Ready"}
            </span>
          </div>

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
                        <small className={index < completedSteps ? "phaseDone" : ""} key={step.phase}>
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

          <div className="observabilityGrid">
            <div>
              <Gauge size={16} aria-hidden="true" />
              <span>Runtime</span>
              <strong>{runtime ? `${runtime.runtime.toFixed(1)}s` : "0.0s"}</strong>
            </div>
            <div>
              <ClipboardList size={16} aria-hidden="true" />
              <span>Tokens</span>
              <strong>{runtime ? runtime.tokens.toLocaleString() : "0"}</strong>
            </div>
            <div>
              <Sparkles size={16} aria-hidden="true" />
              <span>Cost</span>
              <strong>{runtime ? `$${runtime.cost.toFixed(3)}` : "$0.000"}</strong>
            </div>
            <div>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Confidence</span>
              <strong>{runtime ? confidenceLabel(runtime.confidence) : "0%"}</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
