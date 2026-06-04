import { Clock } from "lucide-react";
import type { AnalysisResult } from "../../lib/types";

export function AuditTrail({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="auditList">
      {analysis.audit.map((event) => (
        <div className="auditRow" key={`${event.at}-${event.agent}-${event.action}`}>
          <Clock size={15} aria-hidden="true" />
          <div>
            <strong>{event.agent}</strong>
            <span>
              {event.action}: {event.result}
            </span>
          </div>
          <small>{Math.round(event.confidence * 100)}%</small>
        </div>
      ))}
    </div>
  );
}
