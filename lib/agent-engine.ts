import { runBrainAuthAnalysis } from "./agents/runner";
import type { AnalysisResult } from "./types";

export function buildAnalysis(includeMedicationHistory = false): AnalysisResult {
  return runBrainAuthAnalysis(includeMedicationHistory);
}
