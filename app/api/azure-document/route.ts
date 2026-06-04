import { NextResponse } from "next/server";
import {
  analyzePdfWithAzureDocumentIntelligence,
  getAzureDocumentIntelligenceStatus
} from "../../../lib/azure/documentIntelligence";

export async function GET() {
  return NextResponse.json(getAzureDocumentIntelligenceStatus());
}

export async function POST(request: Request) {
  const status = getAzureDocumentIntelligenceStatus();
  if (status.mode === "local-demo") {
    return NextResponse.json({
      ...status,
      configured: false,
      result:
        "Azure not configured; using deterministic local demo parser for the live MVP."
    });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        configured: true,
        error: "Upload a PDF file in form field 'file'."
      },
      { status: 400 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await analyzePdfWithAzureDocumentIntelligence(bytes, file.type || "application/pdf");

  return NextResponse.json({
    configured: true,
    mode: status.mode,
    result
  });
}
