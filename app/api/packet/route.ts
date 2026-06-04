import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import type { AnalysisResult } from "../../../lib/types";
import { buildAnalysis } from "../../../lib/agent-engine";

function wrapText(text: string, maxChars: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const analysis: AnalysisResult = body?.analysis ?? buildAnalysis(false);
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  const ink = rgb(0.07, 0.1, 0.18);
  const muted = rgb(0.32, 0.36, 0.46);
  const accent = rgb(0.21, 0.58, 0.48);

  let y = 742;
  page.drawText("BrainAuth AI", { x: 44, y, size: 24, font: bold, color: ink });
  page.drawText("Acute stroke documentation draft for clinician review", {
    x: 44,
    y: y - 22,
    size: 11,
    font: regular,
    color: muted
  });
  page.drawText(`Run ${analysis.runId}`, {
    x: 430,
    y,
    size: 10,
    font: mono,
    color: muted
  });
  y -= 58;

  const summary = [
    `Patient: ${analysis.patient.name}, ${analysis.patient.age}${analysis.patient.sex}`,
    `Status: ${analysis.patient.status}`,
    `Facility: ${analysis.patient.facility}`,
    `Readiness score: ${analysis.packet.readinessScore}%`,
    `Evidence coverage: ${analysis.metrics.evidenceCoveragePct}%`,
    `Unsupported claims: ${analysis.metrics.unsupportedClaims}`,
    `Human review items: ${analysis.metrics.humanReviewItems}`,
    `Time saved: ${analysis.packet.minutesSaved} minutes`,
    `Neurons at risk avoided: ${analysis.packet.neuronsAtRiskAvoided.toLocaleString()}`
  ];

  page.drawText("Packet Summary", { x: 44, y, size: 14, font: bold, color: ink });
  y -= 20;
  for (const line of summary) {
    page.drawText(line, { x: 54, y, size: 10, font: regular, color: ink });
    y -= 15;
  }

  y -= 12;
  page.drawText("Criteria Match", { x: 44, y, size: 14, font: bold, color: ink });
  y -= 20;
  for (const criterion of analysis.criteria) {
    const status = criterion.status.toUpperCase();
    const color = criterion.status === "met" ? accent : criterion.status === "missing" ? rgb(0.78, 0.2, 0.18) : rgb(0.76, 0.48, 0.1);
    page.drawText(status, { x: 54, y, size: 8, font: bold, color });
    for (const line of wrapText(`${criterion.criterion}: ${criterion.evidence}`, 72)) {
      page.drawText(line, { x: 112, y, size: 9, font: regular, color: ink });
      y -= 13;
    }
    y -= 4;
  }

  y -= 8;
  page.drawText("Medical Necessity Letter", { x: 44, y, size: 14, font: bold, color: ink });
  y -= 18;
  for (const paragraph of analysis.packet.medicalNecessityLetter.split("\n\n")) {
    for (const line of wrapText(paragraph, 92)) {
      if (y < 64) break;
      page.drawText(line, { x: 54, y, size: 8.5, font: regular, color: ink });
      y -= 11;
    }
    y -= 6;
    if (y < 64) break;
  }

  page.drawText("Human clinician review required before submission. BrainAuth AI does not delay emergency stabilization.", {
    x: 44,
    y: 36,
    size: 8,
    font: bold,
    color: muted
  });

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${analysis.runId}-brainauth-packet.pdf"`
    }
  });
}
