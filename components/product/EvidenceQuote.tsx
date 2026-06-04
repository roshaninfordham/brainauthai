import { FileText } from "lucide-react";
import type { SourceEvidence } from "../../lib/types";

export function EvidenceQuote({ source }: { source: SourceEvidence }) {
  return (
    <article className="evidenceQuote">
      <FileText size={15} aria-hidden="true" />
      <div>
        <strong>{source.documentTitle}</strong>
        <p>{source.sourceQuote}</p>
        <span>
          Page {source.sourcePage} · Confidence {Math.round(source.confidence * 100)}%
        </span>
      </div>
    </article>
  );
}
