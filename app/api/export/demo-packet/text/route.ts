import { NextResponse } from "next/server";
import {
  buildDemoPacketAnalysis,
  buildDemoPacketText,
  demoPacketFilename,
  parseDemoPacketExportOptions
} from "../../../../../lib/export/demoPacket";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const analysis = buildDemoPacketAnalysis(parseDemoPacketExportOptions(request.url));
  const text = buildDemoPacketText(analysis);

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${demoPacketFilename(analysis, "summary", "txt")}"`,
      "Cache-Control": "no-store"
    }
  });
}
