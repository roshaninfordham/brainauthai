"use client";

import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Eye,
  FileHeart,
  HeartPulse,
  PhoneCall,
  Play,
  RadioTower,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
  UserRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type MonitorStatus = "idle" | "analyzing" | "alerted" | "error";

interface FastSignal {
  key: string;
  letter: string;
  label: string;
  status: "critical" | "warning" | "review";
  confidence: number;
  finding: string;
}

interface VisionEvent {
  agentName: string;
  toolName: string;
  message: string;
  evidence: string;
  confidence: number;
  status: "active" | "warning" | "critical" | "success";
}

interface VisionMonitorResult {
  runId: string;
  mode: string;
  serviceLabel: string;
  fileName: string;
  beFastSignals: FastSignal[];
  events: VisionEvent[];
  score: number;
  recommendation: string;
  emergencyCaveat: string;
}

const fallbackSignals: FastSignal[] = [
  {
    key: "balance",
    letter: "B",
    label: "Balance",
    status: "review",
    confidence: 0,
    finding: "Awaiting video sample."
  },
  {
    key: "eyes",
    letter: "E",
    label: "Eyes",
    status: "review",
    confidence: 0,
    finding: "Awaiting video sample."
  },
  {
    key: "face",
    letter: "F",
    label: "Face",
    status: "review",
    confidence: 0,
    finding: "Awaiting video sample."
  },
  {
    key: "arms",
    letter: "A",
    label: "Arms",
    status: "review",
    confidence: 0,
    finding: "Awaiting video sample."
  },
  {
    key: "speech",
    letter: "S",
    label: "Speech",
    status: "review",
    confidence: 0,
    finding: "Awaiting video sample."
  },
  {
    key: "time",
    letter: "T",
    label: "Time",
    status: "review",
    confidence: 0,
    finding: "Awaiting video sample."
  }
];

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function statusTone(status: FastSignal["status"] | VisionEvent["status"]) {
  if (status === "critical") return "danger";
  if (status === "warning") return "warning";
  if (status === "success") return "success";
  return "primary";
}

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function FastMonitor() {
  const [status, setStatus] = useState<MonitorStatus>("idle");
  const [result, setResult] = useState<VisionMonitorResult | null>(null);
  const [visibleEvents, setVisibleEvents] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [demoClipArmed, setDemoClipArmed] = useState(true);

  const events = result?.events ?? [];
  const signals = result?.beFastSignals ?? fallbackSignals;
  const visibleSignalCount = status === "idle" ? 0 : Math.min(signals.length, Math.max(2, visibleEvents));
  const alertReady = status === "alerted";
  const monitorScore = alertReady ? result?.score ?? 91 : status === "analyzing" ? 64 : 0;
  const actionProgress = events.length > 0 ? (visibleEvents / events.length) * 100 : 0;

  const activeEvent = useMemo(() => {
    if (!events.length) return null;
    return events[Math.max(0, Math.min(visibleEvents - 1, events.length - 1))];
  }, [events, visibleEvents]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  async function runMonitor() {
    setStatus("analyzing");
    setError("");
    setVisibleEvents(0);
    setResult(null);

    try {
      const response = await fetch("/api/vision-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: fileName || null })
      });

      if (!response.ok) throw new Error("Vision monitor failed");
      const nextResult = (await response.json()) as VisionMonitorResult;
      setResult(nextResult);

      for (let index = 1; index <= nextResult.events.length; index += 1) {
        await sleep(index === 1 ? 900 : 1150);
        setVisibleEvents(index);
      }

      await sleep(450);
      setStatus("alerted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vision monitor failed");
      setStatus("error");
    }
  }

  function resetMonitor() {
    setStatus("idle");
    setResult(null);
    setVisibleEvents(0);
    setError("");
    setDemoClipArmed(true);
  }

  function handleFileUpload(file: File | undefined) {
    if (!file) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setDemoClipArmed(false);
    setStatus("idle");
    setResult(null);
    setVisibleEvents(0);
  }

  function useDemoClip() {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl("");
    setFileName("synthetic-be-fast-demo.mp4");
    setDemoClipArmed(true);
    setStatus("idle");
    setResult(null);
    setVisibleEvents(0);
  }

  const automatedActions = [
    {
      label: "Emergency prompt",
      detail: "Call emergency services now",
      icon: PhoneCall,
      threshold: 5
    },
    {
      label: "Loved one notified",
      detail: "Care circle SMS queued",
      icon: BellRing,
      threshold: 6
    },
    {
      label: "Doctor callback",
      detail: "Urgent stroke clinician callback requested",
      icon: CalendarClock,
      threshold: 6
    },
    {
      label: "Monitoring audit",
      detail: "B.E. FAST evidence and action log saved",
      icon: FileHeart,
      threshold: 7
    }
  ];

  return (
    <section className="fastMonitorSection" aria-label="B.E. FAST monitoring demo">
      <div className="fastMonitorHeader">
        <div>
          <p className="eyebrow">Azure AI Vision Extension</p>
          <h2>B.E. FAST Monitoring Agent</h2>
          <p>
            Upload or simulate a symptom video. BrainAuth samples the stream, fuses EHR context,
            and prepares emergency-first care-circle actions.
          </p>
        </div>
        <div className="fastMonitorBadges">
          <span>
            <RadioTower size={15} aria-hidden="true" />
            {result?.serviceLabel ?? "Azure AI Vision-ready"}
          </span>
          <span>
            <ShieldCheck size={15} aria-hidden="true" />
            Not diagnostic
          </span>
        </div>
      </div>

      <div className="fastMonitorCaveat">
        <AlertTriangle size={18} aria-hidden="true" />
        <span>
          Stroke symptoms can appear suddenly and demand immediate medical attention.
          Use B.E. FAST: Balance, Eyes, Face, Arms, Speech, Time. If symptoms appear, call emergency services.
        </span>
      </div>

      <div className="fastMonitorGrid">
        <div className="videoMonitorCard">
          <div className="videoToolbar">
            <label className="uploadVideoButton">
              <UploadCloud size={16} aria-hidden="true" />
              Upload Video
              <input
                accept="video/*"
                type="file"
                onChange={(event) => handleFileUpload(event.currentTarget.files?.[0])}
              />
            </label>
            <button type="button" onClick={useDemoClip}>
              <UserRound size={16} aria-hidden="true" />
              Use Demo Clip
            </button>
            <button className="primaryButton" type="button" onClick={() => void runMonitor()} disabled={status === "analyzing"}>
              {status === "analyzing" ? <CircleDot size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
              {status === "analyzing" ? "Monitoring Live" : "Run B.E. FAST Monitor"}
            </button>
            <button className="iconButton" type="button" onClick={resetMonitor} aria-label="Reset B.E. FAST monitor">
              <RefreshCw size={17} aria-hidden="true" />
            </button>
          </div>

          <div className={`visionFrame ${status}`}>
            {videoUrl ? (
              <video src={videoUrl} controls muted playsInline />
            ) : (
              <div className="syntheticVideoScene" aria-label="Synthetic B.E. FAST demo clip">
                <div className="roomGrid" />
                <div className="patientFigure">
                  <span className="head" />
                  <span className="torso" />
                  <span className="arm left" />
                  <span className="arm right" />
                </div>
                <div className="visionBox face">face droop</div>
                <div className="visionBox arm">arm drift</div>
                <div className="visionBox speech">speech cue</div>
              </div>
            )}

            <div className="scanLine" />
            <div className="visionOverlayTop">
              <span>{fileName || (demoClipArmed ? "synthetic-be-fast-demo.mp4" : "No video selected")}</span>
              <strong>{status === "analyzing" ? "Analyzing frames" : alertReady ? "Alert threshold crossed" : "Ready"}</strong>
            </div>
          </div>

          <div className="beFastStrip">
            {signals.map((signal, index) => {
              const visible = index < visibleSignalCount || alertReady;
              return (
                <div className={`beFastTile ${visible ? signal.status : ""}`} key={signal.key}>
                  <strong>{signal.letter}</strong>
                  <span>{signal.label}</span>
                  <small>{visible ? pct(signal.confidence) : "pending"}</small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="monitorVerdictCard">
          <div className={`monitorScore ${alertReady ? "danger" : status === "analyzing" ? "warning" : ""}`}>
            <span>{monitorScore}</span>
            <small>B.E. FAST alert score</small>
          </div>
          <div>
            <p className="eyebrow">Realtime Verdict</p>
            <h3>
              {alertReady
                ? "Emergency escalation prepared"
                : status === "analyzing"
                  ? "Watching live symptoms"
                  : "Upload video to start monitoring"}
            </h3>
            <p>
              {alertReady
                ? result?.recommendation
                : "The monitor looks for sudden B.E. FAST warning signals, then fuses them with longitudinal EHR context and care-circle routing."}
            </p>
          </div>

          <div className="automationGrid">
            {automatedActions.map((action) => {
              const Icon = action.icon;
              const done = visibleEvents >= action.threshold || alertReady;
              return (
                <button className={done ? "autoClicked" : ""} type="button" key={action.label}>
                  {done ? <CheckCircle2 size={16} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
                  <span>
                    <strong>{action.label}</strong>
                    <small>{done ? action.detail : "Waiting for agent threshold"}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="monitorProgress">
            <div>
              <span>Agent progress</span>
              <strong>{visibleEvents}/{events.length || 7}</strong>
            </div>
            <div className={`barTrack ${status === "analyzing" ? "indeterminate" : alertReady ? "danger" : "primary"}`}>
              <span style={{ width: `${Math.max(4, Math.min(100, actionProgress))}%` }} />
            </div>
            <small>{activeEvent?.message ?? "Frame sampling starts when the monitor runs."}</small>
          </div>
        </div>

        <div className="monitorAgentPanel">
          <div className="sectionTitle">
            <ActivityIcon />
            Live Vision Agents
          </div>
          {events.length === 0 && (
            <div className="monitorEmpty">
              <Eye size={24} aria-hidden="true" />
              <strong>Agents standing by</strong>
              <span>Upload a clip or run the synthetic B.E. FAST demo.</span>
            </div>
          )}
          {events.slice(0, visibleEvents).map((event, index) => (
            <div className={`monitorEvent ${event.status}`} key={`${event.agentName}-${index}`}>
              <div className="eventDot" />
              <div>
                <span>{event.agentName} - {event.toolName}</span>
                <strong>{event.message}</strong>
                <small>{event.evidence}</small>
              </div>
              <em>{pct(event.confidence)}</em>
            </div>
          ))}
          {error && (
            <div className="errorBox">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="signalEvidenceGrid">
        {signals.map((signal, index) => {
          const visible = index < visibleSignalCount || alertReady;
          return (
            <article className={`signalEvidence ${visible ? signal.status : ""}`} key={`evidence-${signal.key}`}>
              <div>
                <strong>{signal.letter}</strong>
                <span>{signal.label}</span>
              </div>
              <p>{visible ? signal.finding : "Waiting for sampled frames and context fusion."}</p>
              <div className={`miniBar ${statusTone(visible ? signal.status : "review")}`}>
                <span style={{ width: `${visible ? Math.round(signal.confidence * 100) : 8}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ActivityIcon() {
  return <HeartPulse size={16} aria-hidden="true" />;
}
