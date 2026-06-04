import { AlertTriangle, FileCheck2, ShieldCheck } from "lucide-react";
import type { AnalysisResult } from "../../lib/types";

export function PacketPreview({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="packetPreview">
      <div className="packetHeader">
        <div>
          <span>BrainAuth AI Stroke Packet</span>
          <h3>Transfer + payer-submission documentation draft</h3>
        </div>
        <span className="statusPill done">
          <ShieldCheck size={14} aria-hidden="true" />
          Human review required
        </span>
      </div>

      <section>
        <h4>Patient Summary</h4>
        <p>
          {analysis.patient.name}, {analysis.patient.age}
          {analysis.patient.sex}. NIHSS {analysis.facts.find((fact) => fact.key === "nihss")?.value};
          last-known-well {analysis.facts.find((fact) => fact.key === "last-known-well")?.value}.
        </p>
      </section>

      <section>
        <h4>Imaging Evidence</h4>
        <p>
          CTA source text documents left M1 MCA large-vessel occlusion. CT source
          text documents no acute intracranial hemorrhage and ASPECTS 8.
        </p>
      </section>

      <section>
        <h4>Documentation Gaps</h4>
        {analysis.gaps.map((gap) => (
          <div className="packetGap" key={gap.id}>
            <AlertTriangle size={15} aria-hidden="true" />
            <span>
              <strong>{gap.item}:</strong> {gap.action}
            </span>
          </div>
        ))}
      </section>

      <section>
        <h4>Medical Necessity Draft</h4>
        <p>{analysis.packet.medicalNecessityDraft.text}</p>
      </section>

      <section>
        <h4>Export Safety</h4>
        <div className="packetSafetyGrid">
          <div>
            <FileCheck2 size={16} aria-hidden="true" />
            <span>Unsupported claims</span>
            <strong>{analysis.packet.unsupportedClaims}</strong>
          </div>
          <div>
            <FileCheck2 size={16} aria-hidden="true" />
            <span>Evidence coverage</span>
            <strong>{analysis.metrics.evidenceCoveragePct}%</strong>
          </div>
          <div>
            <FileCheck2 size={16} aria-hidden="true" />
            <span>Review items</span>
            <strong>{analysis.metrics.humanReviewItems}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
