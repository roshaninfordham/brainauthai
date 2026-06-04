import { Database } from "lucide-react";
import type { AnalysisResult } from "../../lib/types";
import { EvidenceQuote } from "./EvidenceQuote";

export function EvidenceMap({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="evidenceMap">
      <div className="reviewBanner">
        <Database size={17} aria-hidden="true" />
        <div>
          <strong>Source-grounded clinical facts</strong>
          <span>
            Every displayed fact maps to a source quote. Missing fields are shown as gaps.
          </span>
        </div>
      </div>
      <div className="factGrid">
        {analysis.facts.map((fact) => (
          <article className="factCard" key={fact.id}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
            <small>Confidence {Math.round(fact.confidence * 100)}%</small>
            <div className="miniBar">
              <span style={{ width: `${Math.round(fact.confidence * 100)}%` }} />
            </div>
            <div className="factSources">
              {fact.sources.map((source) => (
                <EvidenceQuote source={source} key={source.id} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
