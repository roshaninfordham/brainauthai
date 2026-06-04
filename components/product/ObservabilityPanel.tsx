import { ClipboardList, Gauge, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import type { AnalysisResult } from "../../lib/types";

export function ObservabilityPanel({ analysis }: { analysis: AnalysisResult | null }) {
  const metrics = analysis?.metrics;
  return (
    <div className="observabilityGrid">
      <div>
        <Gauge size={16} aria-hidden="true" />
        <span>Runtime</span>
        <strong>{metrics ? `${(metrics.totalDurationMs / 1000).toFixed(1)}s` : "0.0s"}</strong>
      </div>
      <div>
        <ClipboardList size={16} aria-hidden="true" />
        <span>Agent steps</span>
        <strong>{analysis ? analysis.events.length : 0}</strong>
      </div>
      <div>
        <SearchCheck size={16} aria-hidden="true" />
        <span>Evidence coverage</span>
        <strong>{metrics ? `${metrics.evidenceCoveragePct}%` : "0%"}</strong>
      </div>
      <div>
        <ShieldCheck size={16} aria-hidden="true" />
        <span>Unsupported claims</span>
        <strong>{metrics ? metrics.unsupportedClaims : 0}</strong>
      </div>
      <div>
        <Sparkles size={16} aria-hidden="true" />
        <span>Cost placeholder</span>
        <strong>{metrics ? `$${metrics.totalCostUsd.toFixed(3)}` : "$0.000"}</strong>
      </div>
      <div>
        <ShieldCheck size={16} aria-hidden="true" />
        <span>Confidence</span>
        <strong>{metrics ? `${Math.round(metrics.averageConfidence * 100)}%` : "0%"}</strong>
      </div>
    </div>
  );
}
