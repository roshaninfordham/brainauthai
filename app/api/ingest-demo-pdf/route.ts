import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import {
  analyzePdfWithAzureDocumentIntelligence,
  getAzureDocumentIntelligenceStatus
} from "../../../lib/azure/documentIntelligence";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

interface ParsedPdfFact {
  label: string;
  value: string;
  confidence: number;
  sourceQuote: string;
}

export async function GET() {
  const startedAt = Date.now();
  const filePath = path.join(process.cwd(), "public", "demo", "brainauth-stroke-demo-record.pdf");
  const data = await readFile(filePath);
  const azureStatus = getAzureDocumentIntelligenceStatus();
  let text = "";
  let pageCount = 1;
  let parserName = "pdf-parse";
  let mode = "local-open-source-pdf-parse";

  if (azureStatus.mode === "azure-document-intelligence") {
    try {
      const azureResult = await analyzePdfWithAzureDocumentIntelligence(
        new Uint8Array(data),
        "application/pdf"
      );
      text = String(azureResult?.analyzeResult?.content ?? "");
      parserName = "Azure AI Document Intelligence";
      mode = "azure-document-intelligence";
    } catch {
      parserName = "pdf-parse fallback after Azure call failed";
      mode = "local-open-source-pdf-parse";
    }
  }

  const localParsed = await parseWithLocalScript(filePath);
  pageCount = localParsed.total;

  if (!text) text = localParsed.text;
  text = text.replace(/\s+/g, " ").trim();
  const facts = extractFacts(text);

  return NextResponse.json({
    mode,
    parser: parserName,
    fileName: "brainauth-stroke-demo-record.pdf",
    sourcePath: "/demo/brainauth-stroke-demo-record.pdf",
    pageCount,
    processingMs: Date.now() - startedAt,
    textPreview: text.slice(0, 900),
    facts,
    unsupportedClaims: 0,
    humanReviewItems: facts.some((fact) => fact.label === "Medication History") ? 1 : 0
  });
}

async function parseWithLocalScript(filePath: string): Promise<{ total: number; text: string }> {
  const scriptPath = path.join(process.cwd(), "scripts", "parse-demo-pdf.mjs");
  const { stdout } = await execFileAsync(process.execPath, [scriptPath, filePath], {
    maxBuffer: 1024 * 1024
  });
  return JSON.parse(stdout) as { total: number; text: string };
}

function extractFacts(text: string): ParsedPdfFact[] {
  return [
    fact("Patient", match(text, /Patient (John Doe, 64-year-old male)/), 0.96),
    fact("Last Known Well", match(text, /Last Known Well ([0-9:]+ AM)/), 0.94),
    fact("NIHSS", match(text, /NIHSS ([0-9]+)/), 0.96),
    fact("Symptoms", match(text, /Symptoms ([^.]+?)(?= Vitals)/), 0.93),
    fact("Vitals", match(text, /Vitals ([^.]+?)(?= CT Head)/), 0.92),
    fact("CT Head", match(text, /CT Head ([^.]+?ASPECTS 8)/), 0.95),
    fact("CTA Head/Neck", match(text, /CTA Head\/Neck ([^.]+?opacification)/), 0.96),
    fact("Transfer Note", match(text, /Transfer Note ([^.]+?review)/), 0.9),
    fact("Medication History", match(text, /Medication History ([^.]+?packet)/), 0.88)
  ].filter((item): item is ParsedPdfFact => Boolean(item));
}

function fact(label: string, value: string | null, confidence: number): ParsedPdfFact | null {
  if (!value) return null;
  return {
    label,
    value,
    confidence,
    sourceQuote: `${label} ${value}`
  };
}

function match(text: string, pattern: RegExp) {
  return text.match(pattern)?.[1] ?? null;
}
