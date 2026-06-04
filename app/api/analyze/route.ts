import { NextResponse } from "next/server";
import { buildAnalysis } from "../../../lib/agent-engine";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const includeMedicationHistory = Boolean(body.includeMedicationHistory);
  const result = buildAnalysis(includeMedicationHistory);

  return NextResponse.json(result);
}
