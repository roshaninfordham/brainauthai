import { NextResponse } from "next/server";
import {
  buildDemoPacketAnalysis,
  buildDemoPacketPdf,
  demoPacketFilename,
  parseDemoPacketExportOptions
} from "../../../../../lib/export/demoPacket";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const analysis = buildDemoPacketAnalysis(parseDemoPacketExportOptions(request.url));
  const pdf = await buildDemoPacketPdf(analysis);

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${demoPacketFilename(analysis, "packet", "pdf")}"`,
      "Cache-Control": "no-store"
    }
  });
}
