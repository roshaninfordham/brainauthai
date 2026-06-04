import { ClipboardList, Gauge, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import type { AnalysisResult } from "../../lib/types";

export function ObservabilityPanel({ analysis }: { analysis: AnalysisResult | null }) {
  const metrics = analysis?.metrics;
  const criteriaMet = analysis?.criteria.filter((criterion) => criterion.status === "met").length ?? 0;
  const criteriaTotal = analysis?.criteria.length ?? 8;
  const criteriaPercent = analysis ? Math.round((criteriaMet / Math.max(criteriaTotal, 1)) * 100) : 0;
  const evidenceCoverage = metrics?.evidenceCoveragePct ?? 0;
  const confidence = metrics ? Math.round(metrics.averageConfidence * 100) : 0;

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
        <div className="miniBar"><span style={{ width: `${evidenceCoverage}%` }} /></div>
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
        <div className="miniBar"><span style={{ width: `${confidence}%` }} /></div>
      </div>
      <div>
        <ClipboardList size={16} aria-hidden="true" />
        <span>Criteria matched</span>
        <strong>{analysis ? `${criteriaMet}/${criteriaTotal}` : "0/8"}</strong>
        <div className="miniBar warning"><span style={{ width: `${criteriaPercent}%` }} /></div>
      </div>
    </div>
  );
}
