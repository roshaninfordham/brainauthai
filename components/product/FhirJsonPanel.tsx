import type { AnalysisResult } from "../../lib/types";

export function FhirJsonPanel({ analysis }: { analysis: AnalysisResult }) {
  return <pre className="jsonBlock">{JSON.stringify(analysis.packet.fhirPacket, null, 2)}</pre>;
}
