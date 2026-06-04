import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { buildAnalysis } from "../agent-engine";
import type { AnalysisResult, SourceEvidence } from "../types";

export const DEMO_PACKET_NOTICE = "Synthetic BrainAuth demo packet only. No real patient data or PHI.";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_X = 44;
const TOP_Y = 742;
const BOTTOM_Y = 58;
const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

export interface DemoPacketExportOptions {
  includeMedicationHistory?: boolean;
}

interface PdfFonts {
  regular: PDFFont;
  bold: PDFFont;
  mono: PDFFont;
}

interface PdfWriter {
  pdf: PDFDocument;
  page: PDFPage;
  fonts: PdfFonts;
  pageNumber: number;
  y: number;
}

export function buildDemoPacketAnalysis(options: DemoPacketExportOptions = {}): AnalysisResult {
  return buildAnalysis(Boolean(options.includeMedicationHistory));
}

export function parseDemoPacketExportOptions(url: string | URL): DemoPacketExportOptions {
  const params = new URL(url).searchParams;
  const includeMedicationHistory =
    params.get("includeMedicationHistory") === "true" ||
    params.get("includeMedicationHistory") === "1" ||
    params.get("variant") === "complete";

  return { includeMedicationHistory };
}

export function demoPacketFilename(
  analysis: AnalysisResult,
  artifact: "packet" | "summary",
  extension: "pdf" | "txt"
) {
  return `${analysis.runId}-brainauth-demo-${artifact}.${extension}`;
}

export function buildDemoPacketText(analysis = buildDemoPacketAnalysis()) {
  const sourceRefs = uniqueSourceRefs(analysis.packet.medicalNecessityDraft.sourceRefs);
  const lines: string[] = [
    "BrainAuth AI Clinical Packet Summary",
    DEMO_PACKET_NOTICE,
    "",
    `Run ID: ${analysis.runId}`,
    `Generated: ${analysis.generatedAt}`,
    `Disposition: ${analysis.packet.disposition}`,
    "",
    "Patient Snapshot",
    `- Patient: Synthetic demo patient ${analysis.patient.name}, ${analysis.patient.age}${analysis.patient.sex}`,
    `- Facility: ${analysis.patient.facility} (synthetic demo facility)`,
    `- Payer: ${analysis.patient.payer} (synthetic demo payer)`,
    `- Status: ${analysis.patient.status}`,
    "",
    "Readiness Metrics",
    `- Readiness score: ${analysis.packet.readinessScore}%`,
    `- Manual packet baseline: ${analysis.packet.manualMinutes} minutes`,
    `- BrainAuth packet time: ${analysis.packet.brainAuthMinutes} minutes`,
    `- Minutes saved: ${analysis.packet.minutesSaved} minutes`,
    `- Estimated neurons at risk avoided: ${NUMBER_FORMAT.format(analysis.packet.neuronsAtRiskAvoided)}`,
    `- Unsupported claims: ${analysis.packet.unsupportedClaims}`,
    `- Human review items: ${analysis.metrics.humanReviewItems}`,
    "",
    "Clinical Facts"
  ];

  for (const fact of analysis.facts) {
    lines.push(
      `- ${fact.label}: ${fact.value} (${fact.status}; confidence ${formatConfidence(fact.confidence)}; sources ${formatSourceIds(fact.sources)})`
    );
  }

  lines.push("", "Criteria Match");
  for (const criterion of analysis.criteria) {
    lines.push(
      `- [${criterion.status.toUpperCase()}] ${criterion.criterion}: ${criterion.evidence} (confidence ${formatConfidence(criterion.confidence)})`
    );
  }

  lines.push("", "Documentation Gaps");
  if (analysis.gaps.length === 0) {
    lines.push("- No critical documentation gaps remain in the synthetic demo packet.");
  } else {
    for (const gap of analysis.gaps) {
      lines.push(`- ${gap.severity.toUpperCase()} | ${gap.item}: ${gap.action} Owner: ${gap.owner}.`);
    }
  }

  lines.push("", "Blockers");
  if (analysis.packet.blockers.length === 0) {
    lines.push("- None. Treating clinician review and signoff are still required before submission.");
  } else {
    for (const blocker of analysis.packet.blockers) lines.push(`- ${blocker}`);
  }

  lines.push("", "Medical Necessity Draft", analysis.packet.medicalNecessityDraft.text);

  lines.push("", "Packet Source Evidence");
  for (const source of sourceRefs) {
    lines.push(
      `- ${source.id} | ${source.documentTitle} p.${source.sourcePage} | confidence ${formatConfidence(source.confidence)} | "${source.sourceQuote}"`
    );
  }

  lines.push(
    "",
    "Export Safety",
    "- This artifact is generated from deterministic synthetic demo data.",
    "- BrainAuth AI does not diagnose, order treatment, approve care, or delay emergency stabilization.",
    "- Treating clinician review and signature are required before any real-world submission."
  );

  return `${lines.join("\n")}\n`;
}

export async function buildDemoPacketPdf(analysis = buildDemoPacketAnalysis()) {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    mono: await pdf.embedFont(StandardFonts.Courier)
  };
  const writer: PdfWriter = {
    pdf,
    fonts,
    page: pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    pageNumber: 1,
    y: TOP_Y
  };

  drawHeader(writer, analysis);
  writer.y -= 36;

  drawSectionTitle(writer, "Packet Summary");
  drawKeyValueGrid(writer, [
    ["Patient", `Synthetic demo patient ${analysis.patient.name}, ${analysis.patient.age}${analysis.patient.sex}`],
    ["Facility", `${analysis.patient.facility} (synthetic)`],
    ["Payer", `${analysis.patient.payer} (synthetic)`],
    ["Readiness", `${analysis.packet.readinessScore}%`],
    ["Minutes saved", `${analysis.packet.minutesSaved}`],
    ["Unsupported claims", `${analysis.packet.unsupportedClaims}`],
    ["Human review items", `${analysis.metrics.humanReviewItems}`],
    ["Neurons at risk avoided", NUMBER_FORMAT.format(analysis.packet.neuronsAtRiskAvoided)]
  ]);

  drawSectionTitle(writer, "Clinical Facts");
  for (const fact of analysis.facts) {
    drawBullet(
      writer,
      `${fact.label}: ${fact.value} (${fact.status}; confidence ${formatConfidence(fact.confidence)})`
    );
  }

  drawSectionTitle(writer, "Criteria Match");
  for (const criterion of analysis.criteria) {
    drawBullet(
      writer,
      `[${criterion.status.toUpperCase()}] ${criterion.criterion}: ${criterion.evidence} (${formatConfidence(criterion.confidence)})`
    );
  }

  drawSectionTitle(writer, "Documentation Gaps");
  if (analysis.gaps.length === 0) {
    drawBullet(writer, "No critical documentation gaps remain in the synthetic demo packet.");
  } else {
    for (const gap of analysis.gaps) {
      drawBullet(writer, `${gap.severity.toUpperCase()} | ${gap.item}: ${gap.action} Owner: ${gap.owner}.`);
    }
  }

  drawSectionTitle(writer, "Medical Necessity Draft");
  drawParagraphs(writer, analysis.packet.medicalNecessityDraft.text, {
    x: MARGIN_X,
    maxWidth: 524,
    size: 9.2,
    lineHeight: 12.4,
    font: writer.fonts.regular,
    color: rgb(0.08, 0.11, 0.18)
  });

  drawSectionTitle(writer, "Packet Source Evidence");
  for (const source of uniqueSourceRefs(analysis.packet.medicalNecessityDraft.sourceRefs)) {
    drawBullet(
      writer,
      `${source.id} | ${source.documentTitle} p.${source.sourcePage}: "${source.sourceQuote}" (${formatConfidence(source.confidence)})`
    );
  }

  drawSectionTitle(writer, "Export Safety");
  drawBullet(writer, "Generated from deterministic synthetic demo data only.");
  drawBullet(writer, "BrainAuth AI does not diagnose, order treatment, approve care, or delay emergency stabilization.");
  drawBullet(writer, "Treating clinician review and signature are required before any real-world submission.");

  drawFooter(writer);
  return pdf.save();
}

function drawHeader(writer: PdfWriter, analysis: AnalysisResult) {
  const { page, fonts } = writer;
  const ink = rgb(0.06, 0.09, 0.16);
  const muted = rgb(0.34, 0.38, 0.47);
  page.drawText("BrainAuth AI Clinical Packet", { x: MARGIN_X, y: writer.y, size: 22, font: fonts.bold, color: ink });
  page.drawText(DEMO_PACKET_NOTICE, {
    x: MARGIN_X,
    y: writer.y - 20,
    size: 9.6,
    font: fonts.bold,
    color: rgb(0.7, 0.18, 0.16)
  });
  page.drawText(`Run ${analysis.runId}`, { x: 420, y: writer.y, size: 9.2, font: fonts.mono, color: muted });
  page.drawText(analysis.generatedAt, { x: 420, y: writer.y - 14, size: 8.4, font: fonts.mono, color: muted });
}

function drawFooter(writer: PdfWriter) {
  const muted = rgb(0.42, 0.45, 0.52);
  writer.page.drawText("Human clinician review required before submission.", {
    x: MARGIN_X,
    y: 34,
    size: 8.2,
    font: writer.fonts.bold,
    color: muted
  });
  writer.page.drawText(`Page ${writer.pageNumber}`, {
    x: 540,
    y: 34,
    size: 8.2,
    font: writer.fonts.mono,
    color: muted
  });
}

function drawSectionTitle(writer: PdfWriter, title: string) {
  ensureSpace(writer, 34);
  writer.y -= 12;
  writer.page.drawText(title, {
    x: MARGIN_X,
    y: writer.y,
    size: 13,
    font: writer.fonts.bold,
    color: rgb(0.06, 0.09, 0.16)
  });
  writer.y -= 18;
}

function drawKeyValueGrid(writer: PdfWriter, rows: Array<[string, string]>) {
  const labelColor = rgb(0.34, 0.38, 0.47);
  const valueColor = rgb(0.08, 0.11, 0.18);

  for (const [label, value] of rows) {
    ensureSpace(writer, 18);
    writer.page.drawText(`${label}:`, {
      x: MARGIN_X + 10,
      y: writer.y,
      size: 9,
      font: writer.fonts.bold,
      color: labelColor
    });
    writer.page.drawText(value, {
      x: MARGIN_X + 150,
      y: writer.y,
      size: 9,
      font: writer.fonts.regular,
      color: valueColor
    });
    writer.y -= 14;
  }
}

function drawBullet(writer: PdfWriter, text: string) {
  const bulletX = MARGIN_X + 10;
  const textX = MARGIN_X + 24;
  const lines = wrapText(text, writer.fonts.regular, 9, 500);
  ensureSpace(writer, Math.max(18, lines.length * 12 + 4));
  writer.page.drawText("-", {
    x: bulletX,
    y: writer.y,
    size: 9,
    font: writer.fonts.bold,
    color: rgb(0.15, 0.46, 0.4)
  });
  for (const line of lines) {
    writer.page.drawText(line, {
      x: textX,
      y: writer.y,
      size: 9,
      font: writer.fonts.regular,
      color: rgb(0.08, 0.11, 0.18)
    });
    writer.y -= 12;
  }
  writer.y -= 3;
}

function drawParagraphs(
  writer: PdfWriter,
  text: string,
  options: { x: number; maxWidth: number; size: number; lineHeight: number; font: PDFFont; color: RGB }
) {
  for (const paragraph of text.split(/\n{2,}/)) {
    const lines = wrapText(paragraph, options.font, options.size, options.maxWidth);
    for (const line of lines) {
      ensureSpace(writer, options.lineHeight + 4);
      writer.page.drawText(line, {
        x: options.x,
        y: writer.y,
        size: options.size,
        font: options.font,
        color: options.color
      });
      writer.y -= options.lineHeight;
    }
    writer.y -= 6;
  }
}

function ensureSpace(writer: PdfWriter, needed: number) {
  if (writer.y - needed >= BOTTOM_Y) return;
  drawFooter(writer);
  writer.page = writer.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  writer.pageNumber += 1;
  writer.y = TOP_Y;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

function uniqueSourceRefs(sources: SourceEvidence[]) {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.id)) return false;
    seen.add(source.id);
    return true;
  });
}

function formatSourceIds(sources: SourceEvidence[]) {
  return sources.map((source) => source.id).join(", ");
}

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}
