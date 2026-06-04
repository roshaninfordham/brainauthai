import { AlertTriangle, CheckCircle2, SearchCheck } from "lucide-react";
import type { AnalysisResult, CriteriaMatch } from "../../lib/types";
import { EvidenceQuote } from "./EvidenceQuote";

function statusIcon(status: CriteriaMatch["status"]) {
  if (status === "met") return CheckCircle2;
  if (status === "missing") return AlertTriangle;
  return SearchCheck;
}

export function CriteriaMatrix({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="criteriaMatrix">
      {analysis.criteria.map((item) => {
        const Icon = statusIcon(item.status);
        return (
          <article className={`criteriaMatrixRow ${item.status}`} key={item.id}>
            <div className="criteriaMatrixStatus">
              <Icon size={17} aria-hidden="true" />
              <span>{item.status}</span>
            </div>
            <div>
              <strong>{item.criterion}</strong>
              <p>{item.evidence}</p>
              <div className="criteriaSources">
                {item.sources.map((source) => (
                  <EvidenceQuote source={source} key={`${item.id}-${source.id}`} />
                ))}
              </div>
            </div>
            <div className="criteriaConfidence">
              <strong>{Math.round(item.confidence * 100)}%</strong>
              <div className={`miniBar ${item.status === "missing" ? "danger" : item.status === "review" ? "warning" : ""}`}>
                <span style={{ width: `${Math.round(item.confidence * 100)}%` }} />
              </div>
              <span>{item.humanReviewRequired ? "Human review" : "Source matched"}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
